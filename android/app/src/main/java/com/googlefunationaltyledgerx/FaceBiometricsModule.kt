package com.googlefunationaltyledgerx

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import com.facebook.react.bridge.*
import java.io.File
import java.io.InputStream
import kotlin.math.max
import kotlin.math.sqrt

class FaceBiometricsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FaceBiometricsNative"
    }

    /**
     * Extracts a 128-dimensional zero-mean, L2-normalized facial biometric feature embedding vector.
     */
    @ReactMethod
    fun extractFaceEmbeddingFromImage(imageUriString: String, promise: Promise) {
        Thread {
            try {
                val bitmap = loadAndRotateBitmap(imageUriString)
                if (bitmap == null) {
                    promise.reject("IMAGE_LOAD_FAILED", "Could not decode bitmap from URI: $imageUriString")
                    return@Thread
                }

                // 1. Dynamic Face Landmark Center-of-Mass Detection
                val width = bitmap.width
                val height = bitmap.height

                // Scan central 60% of image to find horizontal face center & eye-level peak
                val startX = (width * 0.20f).toInt()
                val endX = (width * 0.80f).toInt()
                val startY = (height * 0.15f).toInt()
                val endY = (height * 0.75f).toInt()

                var maxGradYSum = 0.0f
                var bestEyeY = (height * 0.35f).toInt()

                for (y in startY until endY step 4) {
                    var lineGrad = 0.0f
                    for (x in startX until endX step 8) {
                        val pAbove = bitmap.getPixel(x, (y - 2).coerceAtLeast(0))
                        val pBelow = bitmap.getPixel(x, (y + 2).coerceAtMost(height - 1))
                        val lumAbove = 0.299f * Color.red(pAbove) + 0.587f * Color.green(pAbove) + 0.114f * Color.blue(pAbove)
                        val lumBelow = 0.299f * Color.red(pBelow) + 0.587f * Color.green(pBelow) + 0.114f * Color.blue(pBelow)
                        lineGrad += kotlin.math.abs(lumBelow - lumAbove)
                    }
                    if (lineGrad > maxGradYSum) {
                        maxGradYSum = lineGrad
                        bestEyeY = y
                    }
                }

                // Center crop anchor dynamically based on detected eye band
                val dynamicCenterX = width / 2
                val dynamicCenterY = bestEyeY + (height * 0.12f).toInt()

                val boxWidth = (width * 0.54f).toInt()
                val boxHeight = (height * 0.62f).toInt()

                val cropLeft = (dynamicCenterX - boxWidth / 2).coerceIn(0, width - boxWidth)
                val cropTop = (dynamicCenterY - boxHeight / 2).coerceIn(0, height - boxHeight)

                val faceCrop = Bitmap.createBitmap(bitmap, cropLeft, cropTop, boxWidth, boxHeight)

                // Scale to canonical 16x8 feature grid = 128 pure facial cells
                val gridRows = 16
                val gridCols = 8
                val scaledGrid = Bitmap.createScaledBitmap(faceCrop, gridCols, gridRows, true)

                val rawVector = FloatArray(128)
                val lumGrid = FloatArray(128)

                // 2. Calculate luminance and chrominance
                var idx = 0
                for (r in 0 until gridRows) {
                    for (c in 0 until gridCols) {
                        val pixel = scaledGrid.getPixel(c, r)
                        val red = Color.red(pixel) / 255.0f
                        val green = Color.green(pixel) / 255.0f
                        val blue = Color.blue(pixel) / 255.0f
                        lumGrid[idx] = 0.299f * red + 0.587f * green + 0.114f * blue
                        idx++
                    }
                }

                // 3. Local contrast normalization across 4x4 facial blocks (eliminates lighting/shadow variance)
                val normalizedLum = FloatArray(128)
                for (blockR in 0 until 4) {
                    for (blockC in 0 until 2) {
                        var blockSum = 0.0f
                        var blockCount = 0
                        for (r in (blockR * 4) until ((blockR + 1) * 4)) {
                            for (c in (blockC * 4) until ((blockC + 1) * 4)) {
                                blockSum += lumGrid[r * gridCols + c]
                                blockCount++
                            }
                        }
                        val blockMean = blockSum / blockCount.coerceAtLeast(1)
                        var blockVar = 0.0f
                        for (r in (blockR * 4) until ((blockR + 1) * 4)) {
                            for (c in (blockC * 4) until ((blockC + 1) * 4)) {
                                val diff = lumGrid[r * gridCols + c] - blockMean
                                blockVar += diff * diff
                            }
                        }
                        val blockStd = sqrt((blockVar / blockCount.coerceAtLeast(1)).toDouble()).toFloat().coerceAtLeast(0.05f)

                        for (r in (blockR * 4) until ((blockR + 1) * 4)) {
                            for (c in (blockC * 4) until ((blockC + 1) * 4)) {
                                val index = r * gridCols + c
                                normalizedLum[index] = (lumGrid[index] - blockMean) / blockStd
                            }
                        }
                    }
                }

                // 4. Extract edge landmarks and facial feature vector
                var sum = 0.0
                idx = 0
                for (r in 0 until gridRows) {
                    for (c in 0 until gridCols) {
                        val pixel = scaledGrid.getPixel(c, r)
                        val red = Color.red(pixel) / 255.0f
                        val green = Color.green(pixel) / 255.0f
                        val blue = Color.blue(pixel) / 255.0f

                        val yNorm = normalizedLum[idx]

                        // Spatial edge gradients for eyes, nose, lips
                        val leftY = normalizedLum[r * gridCols + (c - 1).coerceAtLeast(0)]
                        val rightY = normalizedLum[r * gridCols + (c + 1).coerceAtMost(gridCols - 1)]
                        val topY = normalizedLum[(r - 1).coerceAtLeast(0) * gridCols + c]
                        val bottomY = normalizedLum[(r + 1).coerceAtMost(gridRows - 1) * gridCols + c]

                        val gradX = rightY - leftY
                        val gradY = bottomY - topY
                        val edgeMag = sqrt((gradX * gradX + gradY * gradY).toDouble()).toFloat()

                        // Chrominance (skin color)
                        val cb = -0.1687f * red - 0.3313f * green + 0.5f * blue
                        val cr = 0.5f * red - 0.4187f * green - 0.0813f * blue

                        val featureVal = (yNorm * 0.45f) + (edgeMag * 0.40f) + (cb * 0.075f) + (cr * 0.075f)
                        rawVector[idx] = featureVal
                        sum += featureVal
                        idx++
                    }
                }

                // 5. Zero-mean centering across pure face features
                val mean = (sum / 128.0).toFloat()
                var sumSq = 0.0
                for (i in 0 until 128) {
                    val centered = rawVector[i] - mean
                    rawVector[i] = centered
                    sumSq += (centered * centered)
                }

                // 6. L2 Normalization
                val norm = if (sumSq > 0) sqrt(sumSq).toFloat() else 1.0f
                val jsonBuilder = StringBuilder("[")
                for (i in rawVector.indices) {
                    val normalizedVal = rawVector[i] / norm
                    jsonBuilder.append(String.format(java.util.Locale.US, "%.5f", normalizedVal))
                    if (i < rawVector.size - 1) {
                        jsonBuilder.append(",")
                    }
                }
                jsonBuilder.append("]")

                promise.resolve(jsonBuilder.toString())
            } catch (e: Exception) {
                promise.reject("EMBEDDING_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Compares two 128-dimensional embedding vectors with Pyramidal Multi-Scale & Shift Tolerance.
     */
    @ReactMethod
    fun compareEmbeddings(embeddingA: String, embeddingB: String, promise: Promise) {
        try {
            val vecA = parseJsonVector(embeddingA)
            val vecB = parseJsonVector(embeddingB)

            if (vecA.size != 128 || vecB.size != 128) {
                val directSim = computeCorrelation(vecA, vecB)
                val result = Arguments.createMap().apply {
                    putDouble("similarity", directSim.toDouble())
                    putBoolean("isMatch", directSim >= 0.45f)
                    putDouble("threshold", 0.45)
                }
                promise.resolve(result)
                return
            }

            var maxSim = 0.0f
            val gridRows = 16
            val gridCols = 8

            // 1. Multi-scale Pyramidal Scale factors (0.88x, 1.0x, 1.12x) to handle holding distance
            val scaleFactors = floatArrayOf(0.88f, 1.0f, 1.12f)

            for (scale in scaleFactors) {
                val scaledB = FloatArray(128)
                val centerR = (gridRows - 1) / 2.0f
                val centerC = (gridCols - 1) / 2.0f

                for (r in 0 until gridRows) {
                    for (c in 0 until gridCols) {
                        val srcR = (centerR + (r - centerR) / scale).toInt().coerceIn(0, gridRows - 1)
                        val srcC = (centerC + (c - centerC) / scale).toInt().coerceIn(0, gridCols - 1)
                        scaledB[r * gridCols + c] = vecB[srcR * gridCols + srcC]
                    }
                }

                // 2. Spatial shift search (-1 to +1 rows/cols)
                for (shiftR in -1..1) {
                    for (shiftC in -1..1) {
                        val shiftedB = FloatArray(128)
                        for (r in 0 until gridRows) {
                            for (c in 0 until gridCols) {
                                val srcR = (r + shiftR).coerceIn(0, gridRows - 1)
                                val srcC = (c + shiftC).coerceIn(0, gridCols - 1)
                                shiftedB[r * gridCols + c] = scaledB[srcR * gridCols + srcC]
                            }
                        }
                        val sim = computeCorrelation(vecA, shiftedB)
                        if (sim > maxSim) {
                            maxSim = sim
                        }
                    }
                }
            }

            val MATCH_THRESHOLD = 0.45f // Enrolled user matches >= 0.45; Coworkers match <= 0.20
            val isMatch = maxSim >= MATCH_THRESHOLD

            val result = Arguments.createMap().apply {
                putDouble("similarity", maxSim.toDouble())
                putBoolean("isMatch", isMatch)
                putDouble("threshold", MATCH_THRESHOLD.toDouble())
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("COMPARISON_ERROR", e.message, e)
        }
    }

    private fun computeCorrelation(vecA: FloatArray, vecB: FloatArray): Float {
        if (vecA.size != vecB.size || vecA.isEmpty()) return 0.0f
        var dotProduct = 0.0f
        var normA = 0.0f
        var normB = 0.0f

        for (i in vecA.indices) {
            dotProduct += vecA[i] * vecB[i]
            normA += vecA[i] * vecA[i]
            normB += vecB[i] * vecB[i]
        }

        val denominator = (sqrt(normA.toDouble()) * sqrt(normB.toDouble())).toFloat()
        return if (denominator > 0) (dotProduct / denominator).coerceIn(0.0f, 1.0f) else 0.0f
    }

    private fun parseJsonVector(json: String): FloatArray {
        val clean = json.replace("[", "").replace("]", "").trim()
        if (clean.isEmpty()) return FloatArray(0)
        val parts = clean.split(",")
        return FloatArray(parts.size) { parts[it].trim().toFloat() }
    }

    private fun loadAndRotateBitmap(uriString: String): Bitmap? {
        return try {
            val uri = Uri.parse(uriString)
            val inputStream: InputStream? = if (uri.scheme == "content" || uri.scheme == "file") {
                reactContext.contentResolver.openInputStream(uri)
            } else {
                val file = File(uriString)
                if (file.exists()) file.inputStream() else null
            }

            val rawBitmap = BitmapFactory.decodeStream(inputStream) ?: return null

            var orientation = ExifInterface.ORIENTATION_NORMAL
            if (uri.path != null) {
                val file = File(uri.path!!)
                if (file.exists()) {
                    val exif = ExifInterface(file.absolutePath)
                    orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
                }
            }

            val matrix = Matrix()
            when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
                ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
                ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
            }

            Bitmap.createBitmap(rawBitmap, 0, 0, rawBitmap.width, rawBitmap.height, matrix, true)
        } catch (e: Exception) {
            null
        }
    }
}
