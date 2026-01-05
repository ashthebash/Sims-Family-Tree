# 🌳 Sims Family Tree Editor

A web-based interactive family tree editor for The Sims, inspired by [TheSimsTree.com](https://thesimstree.com/). Create, edit, and visualize your Sims family stories with an intuitive drag-and-drop interface.

**[Live Demo](https://ashthebash.github.io/Sims-Family-Tree/)**

## ✨ Features

### Core Functionality
- **Interactive Family Tree Visualization**: Drag and drop Sims to arrange your family tree
- **Comprehensive Sim Profiles**: Track name, gender, life stage, traits, aspirations, occupations, and notes
- **Relationship Management**: Create parent-child, spouse/partner, and sibling relationships
- **Avatar Support**: Add custom avatar URLs or use auto-generated initials with gender-based colors
- **JSON Import/Export**: Save and share your family trees in portable JSON format
- **Auto-save**: Local storage backup every 30 seconds
- **Search & Filter**: Quickly find Sims by name, traits, or occupation

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Zoom & Pan**: Navigate large family trees with ease
- **Color-Coded Relationships**: Visual distinction between relationship types
- **Dark Theme Ready**: Modern, polished UI with gradient headers
- **Example Family**: Pre-loaded Goth family for quick start

## 🚀 Getting Started

### Online (GitHub Pages)
Simply visit the [live demo](https://ashthebash.github.io/Sims-Family-Tree/) to start using the editor immediately.

### Local Development
1. Clone this repository:
   ```bash
   git clone https://github.com/ashthebash/Sims-Family-Tree.git
   cd Sims-Family-Tree
   ```

2. Open `index.html` in your web browser:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or just open the file directly
   open index.html
   ```

3. Start creating your family tree!

## 📖 How to Use

### Adding Sims
1. Click the **"Add Sim"** button in the toolbar
2. Fill in the Sim's details:
   - Name (required)
   - Gender, Life Stage
   - Traits, Aspiration, Occupation
   - Avatar URL (optional)
   - Notes
3. Click **"Save Sim"**

### Creating Relationships
1. Click the **"Add Relationship"** button
2. Select the relationship type:
   - **Parent-Child**: Creates a generational connection
   - **Spouse/Partner**: Links two Sims romantically
   - **Sibling**: Connects siblings
3. Select the relevant Sims from the dropdowns
4. Click **"Add Relationship"**

### Managing Your Tree
- **Drag Nodes**: Click and drag Sim nodes to rearrange them
- **Edit Sims**: Click on a Sim card in the sidebar and click "Edit"
- **Delete Sims**: Click "Delete" on any Sim card (removes all related relationships)
- **Zoom Controls**: Use the +/- buttons or mouse wheel
- **Reset View**: Click the reset button to center the tree

### Import/Export
- **Export**: Click "Export JSON" to download your family tree
- **Import**: Click "Import JSON" to load a previously saved tree
- **Example**: Click "Load Example" to see the Goth family tree

## 📁 Project Structure

```
Sims-Family-Tree/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── app.js              # Main application logic
│   └── family-tree.js      # Tree visualization engine
├── assets/
│   └── examples/
│       └── goth-family.json # Example family tree
└── README.md
```

## 🎨 JSON Format

Family trees are stored in the following JSON format:

```json
{
  "version": "1.0",
  "sims": [
    {
      "id": "sim_1",
      "name": "Bella Goth",
      "gender": "female",
      "age": "adult",
      "traits": "Family-Oriented, Romantic, Creative",
      "aspiration": "Successful Lineage",
      "occupation": "Politician",
      "avatar": "https://example.com/avatar.jpg",
      "notes": "Matriarch of the Goth family",
      "x": 300,
      "y": 100
    }
  ],
  "relationships": [
    {
      "from": "sim_1",
      "to": "sim_2",
      "type": "spouse"
    }
  ],
  "metadata": {
    "created": "2026-01-05",
    "simCount": 1
  }
}
```

## 🖼️ Avatar Management

Currently, avatars are managed via URLs. You can:
- **Use external URLs**: Link to images hosted elsewhere
- **Leave blank**: Auto-generated initials with gender-based colors
  - 💙 Blue for male
  - 💖 Pink for female
  - 💜 Purple for other

**Future Enhancement**: Base64 encoding support for embedded images in JSON files.

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Font Awesome 6**: Icon library
- **LocalStorage API**: Auto-save functionality
- **GitHub Pages**: Free static hosting

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Known Limitations

- **No Server-Side Storage**: Data is stored locally or via JSON export
- **Large Images**: Avatar URLs only (no file uploads to GitHub Pages)
- **No Undo/Redo**: Manual save management via export
- **Performance**: Very large trees (100+ Sims) may experience slowdown

## 🗺️ Roadmap

- [ ] Base64 image encoding for avatars
- [ ] Undo/Redo functionality
- [ ] Automatic layout algorithm
- [ ] Print/PDF export
- [ ] Multiple family tree projects
- [ ] Shareable URLs (via GitHub Gist integration)
- [ ] Custom color themes
- [ ] Relationship labels and dates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [TheSimsTree.com](https://thesimstree.com/)
- Icons by [Font Awesome](https://fontawesome.com/)
- The Sims franchise by EA/Maxis

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Enjoy creating your Sims family stories! 🎮✨**