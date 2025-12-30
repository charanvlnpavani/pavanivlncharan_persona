## Persona Frontend

This project is a modern, responsive frontend application designed to showcase a personal or professional portfolio. Built with React, TypeScript, and Vite, it provides a clean and interactive user experience for presenting information such as skills, projects, work experience, education, and social media links.

### Features

- **Profile Overview:** Display personal information, avatar, and a hero section.
- **Projects Showcase:** List and describe projects with details and links.
- **Skills Display:** Visualize technical and soft skills.
- **Work & Study Timeline:** Present work experience and educational background.
- **Social Media Integration:** Link to various social platforms.
- **Navigation:** Responsive navbar and sidebar for easy navigation.
- **Reusable UI Components:** Includes buttons, cards, tooltips, badges, avatars, and more.
- **Mobile Friendly:** Optimized for mobile and desktop devices.

### Project Structure

- `public/`: Static assets and JSON data (projects, skills, socials, documents).
- `src/`: Main source code.
  - `assets/`: Images and document assets.
  - `components/`: Reusable UI and common components.
  - `hooks/`: Custom React hooks.
  - `lib/`: Utility and profile logic.
  - `pages/`: Main application pages (About, Profile, Projects, Skills, etc.).
  - `routes/`: Application routing configuration.

### Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

### Technologies Used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/)

### Customization

Edit the JSON files in the `public/` directory to update projects, skills, and social links. Update images and documents in the `src/assets/` and `public/documents/` folders as needed.

### License

This project is open source and available under the MIT License.
