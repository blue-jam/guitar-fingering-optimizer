# Guitar Fingering Optimization

A React + TypeScript Single Page Application (SPA) for optimizing guitar fingering positions from MIDI files.

## Features

- **MIDI File Processing**: Upload and parse MIDI files with multiple track support
- **Guitar Configuration**: Comprehensive guitar setup customization including:
  - Fret count (19-24 frets)
  - Number of strings (4-12)
  - String tuning (MIDI note numbers)
  - Fret distances per string (in millimeters)
  - Difficulty values for each fret (0-1 scale)
  - Maximum finger span (in millimeters)
  - Copy fret distances from one string to all strings
- **Configuration Management**: Export and import guitar configurations as JSON files
- **Sheet Music Display**: Visualize MIDI files using OpenSheetMusicDisplay
- **Fingering Optimization**: Calculate optimal fingering positions (frontend computation)

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **OpenSheetMusicDisplay** - Sheet music rendering
- **@tonejs/midi** - MIDI file parsing

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## Building

```bash
npm run build
```

The production build will be created in the `dist/` directory.

## Usage

1. **Configure Your Guitar**:
   - Adjust fret count, string count, and finger span in the right panel
   - Customize string tuning and fret distances for each string
   - Set difficulty values for different fret positions
   - Export your configuration for future use

2. **Upload a MIDI File**:
   - Click "Choose File" in the left panel
   - Select a MIDI file from your computer
   - If the file has multiple tracks, select the desired track

3. **View Sheet Music**:
   - The sheet music will automatically display in the center panel

4. **Optimize Fingering**:
   - Click "Optimize Fingering" to calculate optimal finger positions
   - View the results showing how many notes were successfully fingered

## Configuration Format

Guitar configurations are exported as JSON files with the following structure.
See `example-config.json` for a complete example.

```json
{
  "guitarConfig": {
    "fretCount": 22,
    "stringCount": 6,
    "strings": [
      {
        "tuning": 40,
        "fretDistances": [650, 613.5, ...],
        "difficulty": [0.1, 0.14, ...]
      }
    ],
    "fingerSpan": 100
  }
}
```

## Optimization Algorithm

The current implementation includes a placeholder optimization algorithm. The algorithm considers:
- String tuning and fret positions
- Physical constraints (fret distances, finger span)
- Difficulty values for each fret
- Smooth transitions between positions

**Note**: The optimization algorithm is simplified and can be enhanced with more sophisticated algorithms considering:
- Hand position changes
- Finger strength and reach
- Musical phrasing
- Ergonomic considerations

## License

See LICENSE file for details.
