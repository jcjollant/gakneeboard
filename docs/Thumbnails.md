# Thumbnails

This document explains where thumbnails are stored and the process for generating and processing them.

## Storage Location

Thumbnails for templates and other assets are stored in the public directory of the UI project:

`ui/public/thumbnails`

## Creating a Thumbnail

To create a new thumbnail for a template:

1. **Open the Template**: Navigate to the template you wish to capture in the application.
2. **Enter Editor Mode**: Toggle the editor mode on.
3. **Capture the Page**: Use the capture functionality to take a snapshot of the page. This is typically done by:
   - Enabling "Capture Mode" (if available in the menu).
   - Or holding `Shift` and clicking on the page or specific tile you want to capture.
   - The image will be downloaded to your computer.

## Processing the Thumbnail

After capturing the image, it must be resized to a standard width of 800 pixels to ensure consistency and optimize performance.

1. Move the captured image to the thumbnails directory: `ui/public/thumbnails`.
2. Rename the file if necessary to match the template ID or name convention (e.g., `template-name-0.png`).
3. Open your terminal and navigate to the thumbnails directory.
4. Run the following command to resize the image:

```bash
sips -Z 800 <filename>
```

### Examples

```bash
# Navigate to the directory
cd ui/public/thumbnails

# Resize a specific file
sips -Z 800 seattle-ga-1.png

# Resize multiple files (if needed)
sips -Z 800 reference-0.png
```

This command uses the macOS built-in Scriptable Image Processing System (`sips`) to resize the image while maintaining its aspect ratio, setting the maximum dimension to 800 pixels.
