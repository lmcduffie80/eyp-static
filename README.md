# Externally Yours Productions - Static Marketing Website

A modern, responsive static marketing website for Externally Yours Productions.

## Features

- **Fully Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, professional design with smooth animations
- **Fast Loading** - Optimized static HTML/CSS/JavaScript
- **SEO Friendly** - Proper meta tags and semantic HTML structure
- **Easy to Customize** - All styling is in the HTML file for easy modifications

## Customization Guide

### Replace Images

The website currently uses placeholder images from Unsplash. To add your own photos:

1. **Hero Section** (line ~265): Replace the background image URL in the `.hero` section's `background` CSS property
2. **About Section** (line ~278): Replace the `src` attribute of the `.about-image` img tag
3. **Portfolio Section** (lines ~323-348): Replace all portfolio item image `src` attributes with your actual project photos

### Update Content

1. **Company Information**: Update the About section text (lines ~274-277)
2. **Services**: Modify service cards as needed (lines ~287-315)
3. **Contact Information**: Update email, phone, and address (lines ~365-369)
4. **Portfolio Projects**: Update portfolio item titles and add your actual project images

### Customize Colors

Edit the CSS variables at the top of the `<style>` section (lines ~17-24):

```css
:root {
    --primary-color: #1a1a1a;      /* Main dark color */
    --secondary-color: #ffffff;    /* White/light color */
    --accent-color: #ff6b35;       /* Accent/highlight color */
    --text-dark: #333;             /* Dark text */
    --text-light: #666;            /* Light text */
    --bg-light: #f8f8f8;           /* Light background */
}
```

### Form Submission

The contact form currently shows an alert. To make it functional:

1. **Option 1**: Use a service like Formspree, Netlify Forms, or EmailJS
2. **Option 2**: Connect to your own backend API endpoint

Update the form's `action` attribute and remove the JavaScript `preventDefault()` if using a backend.

## Deployment

This is a static site that can be deployed to:

- **Netlify** - Drag and drop the folder or connect via Git
- **Vercel** - Deploy via CLI or GitHub integration
- **GitHub Pages** - Push to a repository and enable GitHub Pages
- **AWS S3 + CloudFront** - For scalable static hosting
- **Any web hosting service** - Upload the files via FTP/SFTP

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

All rights reserved. You own all photos and content.

