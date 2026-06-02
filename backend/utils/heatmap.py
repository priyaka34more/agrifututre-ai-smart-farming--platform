import tensorflow as tf
import numpy as np
import cv2


# =========================
# 🔥 GENERATE HEATMAP (Grad-CAM)
# =========================
def generate_heatmap(model, img_array):

    try:
        # Find last convolution layer automatically
        last_conv_layer = None
        for layer in reversed(model.layers):
            if "conv" in layer.name:
                last_conv_layer = layer
                break

        if last_conv_layer is None:
            raise Exception("No conv layer found")

        grad_model = tf.keras.models.Model(
            [model.inputs],
            [last_conv_layer.output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            class_idx = tf.argmax(predictions[0])
            loss = predictions[:, class_idx]

        grads = tape.gradient(loss, conv_outputs)

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]

        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        heatmap = np.maximum(heatmap, 0)

        if np.max(heatmap) != 0:
            heatmap /= np.max(heatmap)

        return heatmap.numpy()

    except Exception:
        return None


# =========================
# 🎨 OVERLAY HEATMAP
# =========================
def overlay_heatmap(original_img, heatmap):

    try:
        if heatmap is None:
            return original_img

        heatmap = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
        heatmap = np.uint8(255 * heatmap)

        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        overlay = cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)

        return overlay

    except Exception:
        return original_img