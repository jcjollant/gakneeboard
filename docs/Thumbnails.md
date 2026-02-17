# Thumbnails

This document explains the automated thumbnail generation process and how they are stored and managed across different environments.

## Automated Generation

Thumbnails for user templates are automatically generated in the UI when a template is saved or loaded.

1. **Capture**: The UI uses `html2canvas` to capture a snapshot of the first page (index 0) of the template.
2. **Resizing**: The captured canvas is scaled down to a standard thumbnail size (width of 200px).
3. **Upload**: The resulting image blob is sent to the backend via `TemplateService.updateThumbnail`.

## Backend Storage

The backend receives the thumbnail and stores it in **Vercel Blob storage**.

- **Service**: Managed by `server/backend/services/TemplateService.ts`.
- **Target**: Files are stored with the naming convention `${templateId}.png`.

## Environment Separation

To avoid polluting production assets during development or testing, the storage directory in Vercel Blob is controlled by an environment variable.

### `BLOB_THUMBNAILS_DIRECTORY`

- **Production**: Defaults to `thumbnails`.
- **Development/Test**: Set to `thumbnails-test` (or similar) in the `.env` file.

This ensures that thumbnails generated on localhost or in test environments are isolated from production thumbnails, even if the template IDs overlap.

> [!NOTE]
> Previously, the UI negated the template ID for tests. This has been replaced by the `BLOB_THUMBNAILS_DIRECTORY` environment variable for cleaner separation.

## Static Assets

Legacy or demo template thumbnails may still be stored in the UI project:

`ui/public/thumbnails`

These are typically managed manually if needed, but the application increasingly relies on the automated Vercel Blob storage for all custom user content.

## Manual Thumbnail Creation

To manually create a new thumbnail for a template:

1. **Open the Template**: Navigate to the template you wish to capture in the application.
2. **Enter Editor Mode**: Toggle the editor mode on.
3. **Capture the Page**: Use the capture functionality to take a snapshot of the page. This is typically done by:
   - Enabling "Capture Mode" (if available in the menu).
   - Or holding `Shift` and clicking on the page or specific tile you want to capture.
   - The image will be downloaded to your computer.

### Processing the Thumbnail

After capturing the image, it must be resized to a standard width of 800 pixels to ensure consistency and optimize performance.

1. Move the captured image to the thumbnails directory: `ui/public/thumbnails`.
2. Rename the file if necessary to match the template ID or name convention (e.g., `template-name-0.png`).
3. Open your terminal and navigate to the thumbnails directory.
4. Run the following command to resize the image:

```bash
sips -Z 800 <filename>
```
