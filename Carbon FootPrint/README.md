# Project Setup & Build Instructions

## Overview
This project was developed using Google AI Studio and is configured to run locally. The required Google API key is already included in the `.env` file, so no additional API setup is needed.

---

## Getting Started

Follow the steps below to download and run the project locally.

### 1. Download the Project
- Go to the GitHub repository
- Download the project as a ZIP file
- Extract the ZIP file to your desired location

---

### 2. Open the Project
- Open a terminal
- Navigate into the project directory:

```bash
cd your-project-folder
```

---

### 3. Install Dependencies
Run the following command to install all required packages:

```bash
npm install
```

---

### 4. Build the Project
Run the build command:

```bash
npm build
```

---

### 5. Run the Project
Start the application locally with:

```bash
npm run build
```

---

## Notes
- The `.env` file is already configured with the necessary Google API key.
- Make sure you have Node.js and npm installed on your machine.

---

## Troubleshooting

If you run into issues:
- Ensure dependencies are installed (`npm install`)
- Check your Node.js version
- Try deleting `node_modules` and reinstalling

```bash
rm -rf node_modules
npm install
```

---

## Requirements

- Node.js (recommended v16 or higher)
- npm

---

## Done 🎉

You should now have the project running locally!

