# Asset Specifications

Detailed specifications for creating images and videos for the German learning app.

---

## Image Specifications

### Dimensions
| Use Case | Dimensions | Aspect Ratio |
|----------|------------|--------------|
| Vocabulary illustration | 800 x 600 px | 4:3 landscape |
| Dialog scene | 800 x 600 px | 4:3 landscape |
| Grammar diagram | 800 x 400 px | 2:1 wide |
| Portrait/character | 600 x 800 px | 3:4 portrait |

### Format
- **Preferred**: JPG for photos, PNG for illustrations/diagrams
- **Quality**: 80-90% for JPG
- **Max file size**: 500 KB

### Style Guide
- **Tone**: Friendly, welcoming, educational
- **People**: Diverse ages, ethnicities, genders
- **Setting**: Modern, clean, relatable (office, cafe, street, home)
- **Colors**: Bright, warm, not too saturated
- **Text**: Avoid text in images (app adds translations)

### Naming Convention
```
{lesson-id}/{descriptive-name}.{ext}

Examples:
A1-1-M01-L01/greeting-handshake.jpg
A1-1-M01-L02/introducing-self.jpg
A1-1-M02-L04/family-dinner.png
```

---

## Video Specifications

### Technical Specs
| Property | Specification |
|----------|---------------|
| Format | MP4 (H.264 codec) |
| Resolution | 1080p (1920x1080) or 720p (1280x720) |
| Frame rate | 30 fps |
| Audio | AAC, 128 kbps stereo |
| Max duration | 30 seconds |
| Max file size | 10 MB |

### Content Guidelines
- **Duration**: 10-30 seconds typical
- **Audio**: Clear German pronunciation, minimal background noise
- **Subtitles**: Not needed (app provides translations)
- **Intro/Outro**: None needed - start directly with content

### Types of Videos Needed

#### 1. Dialog Videos
Short conversations between 2 people:
- Clear view of speakers
- Natural gestures and expressions
- Synchronized lip movement with audio
- Example: Two people greeting each other

#### 2. Vocabulary Videos
Single word/phrase demonstrations:
- Show the action or object
- Audio pronunciation
- 5-10 seconds each
- Example: Someone waving and saying "Hallo!"

#### 3. Cultural Context Videos
Showing German customs/situations:
- Real-world settings
- Authentic behavior
- Brief explanation through action
- Example: Formal handshake in business setting

### Naming Convention
```
{lesson-id}/{descriptive-name}.mp4

Examples:
A1-1-M01-L01/greeting-dialog.mp4
A1-1-M01-L03/goodbye-friends.mp4
```

---

## Output Paths

All assets go into:
```
apps/web/static/images/{lesson-id}/
apps/web/static/videos/{lesson-id}/
```

Create the lesson folder if it doesn't exist.

### Example Full Paths
```
apps/web/static/images/A1-1-M01-L01/greeting-handshake.jpg
apps/web/static/videos/A1-1-M01-L01/greeting-dialog.mp4
```

---

## Quality Checklist

Before marking a task complete, verify:

### Images
- [ ] Correct dimensions
- [ ] File size under 500 KB
- [ ] No text/watermarks
- [ ] Matches description
- [ ] Saved to correct path
- [ ] Filename matches spec

### Videos
- [ ] Correct resolution (1080p or 720p)
- [ ] Audio is clear
- [ ] Duration under 30 seconds
- [ ] File size under 10 MB
- [ ] Matches description
- [ ] Saved to correct path

---

## Tools Recommendations

### Image Creation
- **Stock photos**: Unsplash, Pexels (free)
- **AI generation**: Midjourney, DALL-E, Stable Diffusion
- **Editing**: Photoshop, GIMP, Canva

### Video Creation
- **Stock video**: Pexels Videos, Pixabay
- **Recording**: iPhone/Android with good lighting
- **Editing**: DaVinci Resolve (free), Premiere Pro
- **Audio**: Record separately for clarity

---

## Contact for Questions

If task description is unclear:
1. Add question to `notes` field in task JSON
2. Set status to `blocked`
3. Continue with other tasks
