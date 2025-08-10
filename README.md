# Business Card Scanner App �

This is a React Native app built with [Expo](https://expo.dev) that allows you to scan, store, and organize business cards.

## Features ✨

- 📷 **Dual-side Scanning**: Capture both front and back of business cards
- 🤖 **Real OCR with Validation**: Automatic text extraction with quality verification
- ⚠️ **Smart Retry System**: Prompts to retake photos if text extraction fails
- 🖼️ **Gallery Import**: Import existing business card images
- ✍️ **Manual Entry Fallback**: Add text manually when OCR isn't available
- 🔍 **Smart Search**: Search through your cards by name, company, email, phone
- 🏷️ **Advanced Filtering**: Filter by contact type, recent cards, organized data
- 📊 **Organized Display**: View cards with structured sections (Personal, Organization, Contact)
- 💾 **Local Storage**: All data stored securely on your device
- ✅ **Text Preview**: See extracted text before saving

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## How to Use 📖

1. **Scan a Card**: Tap "📷 Scan Card" to take photos of front/back sides
2. **Import from Gallery**: Tap "📁 Import from Gallery" to use existing photos
3. **Add Text**: When prompted, enter the text details manually or skip for image-only storage
4. **Search & Filter**: Use the search bar and filter buttons to find specific cards
5. **View Details**: Tap action buttons to see raw text or contact information

## Text Recognition 🔤

The app features **OCR (Optical Character Recognition)** with intelligent fallbacks:

### Current Status:

- **Development Build**: Full OCR functionality with MLKit
- **Expo Go**: Graceful fallback to manual text entry (OCR libraries require native compilation)

### How it works:

1. **Automatic Detection**: App detects if OCR is available in current environment
2. **Smart Fallback**: If OCR isn't available, provides clear messaging and manual entry option
3. **Manual Entry**: High-quality manual text input with smart parsing
4. **Image Storage**: Always saves images for reference, regardless of text extraction

### For Best Results:

- 📸 Use good lighting and clear images
- 📐 Keep business cards straight and flat
- � For full OCR: Use `expo run:android` or `expo run:ios` (development build)
- 📱 For Expo Go: Manual text entry works perfectly

### Features Available in All Environments:

- ✅ Image capture and storage
- ✅ Manual text entry with smart parsing
- ✅ Advanced search and filtering
- ✅ Organized contact display
- ✅ All core functionality

## Data Organization 📋

Entered text is automatically parsed and organized into:

- **Personal**: Name, Title
- **Organization**: Company, Department
- **Contact**: Emails, Phone numbers, Websites, Addresses

## Future Enhancements 🚀

- Real-time OCR integration
- Export to contacts/CSV
- Card categories and tags
- Duplicate detection
- Cloud backup

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
