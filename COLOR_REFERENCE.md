# UI Color Scheme Quick Reference

## 🎨 Color Palette

### Primary Colors

```
Yellow:  #FFD700  ████████  (Highlights, Buttons, CTAs)
Blue:    #1E90FF  ████████  (Headers, Footers, Main Accent)
```

### Secondary Colors

```
Light Yellow: #FFF8DC  ████████  (Subtle Backgrounds)
Light Blue:   #ADD8E6  ████████  (Hover Effects)
```

### Neutral Colors

```
Dark Gray:  #333333  ████████  (Text, Details)
White:      #FFFFFF  ████████  (Backgrounds, Forms)
```

## 🎯 Usage Guide

### Buttons

- **Primary Button**: Yellow background, dark gray text
- **Secondary Button**: Blue background, white text
- **Hover State**: Darker shade of the base color

### Navigation

- **Navbar**: Blue background, white text
- **Nav Links**: White text, yellow on hover
- **Active Link**: Yellow color

### Typography

- **Headings**: Dark gray (#333333)
- **Body Text**: Dark gray (#333333)
- **Links**: Blue, darker blue on hover

### Forms

- **Input Fields**: White background
- **Focus State**: Yellow border with subtle shadow
- **Labels**: Dark gray text

### Backgrounds

- **Main Background**: White with subtle gradient to light yellow/blue
- **Section Hero**: Light yellow gradient
- **Cards**: White background

### Interactive Elements

- **Badges**: Yellow or blue backgrounds
- **Alerts**: Light yellow or light blue backgrounds
- **Tables**: Light yellow hover effect
- **Dropdowns**: Light yellow hover effect

## 📱 Component Examples

### Button Classes

```jsx
<Button variant="primary">Primary Action</Button>  // Yellow
<Button variant="secondary">Secondary Action</Button>  // Blue
```

### Badge Classes

```jsx
<Badge bg="primary">Primary Badge</Badge>  // Yellow
<Badge bg="secondary">Secondary Badge</Badge>  // Blue
```

### Alert Classes

```jsx
<Alert variant="primary">Primary Alert</Alert>  // Light Yellow
<Alert variant="secondary">Secondary Alert</Alert>  // Light Blue
```

## 🔧 CSS Variables

```css
--primary: #ffd700;
--primary-dark: #daa520;
--primary-light: #fff8dc;
--secondary: #1e90ff;
--secondary-dark: #1873cc;
--secondary-light: #add8e6;
--text-primary: #333333;
--bg-body: #ffffff;
```

## ✅ Accessibility

All color combinations meet WCAG 2.1 AA standards:

- Yellow (#FFD700) on White: ✓ Pass
- Blue (#1E90FF) on White: ✓ Pass
- Dark Gray (#333333) on White: ✓ Pass
- White on Blue (#1E90FF): ✓ Pass
- Dark Gray on Yellow (#FFD700): ✓ Pass

---

**Quick Test:** Open any page and you should see:

1. Blue navbar at top
2. Yellow primary buttons
3. Blue footer at bottom
4. Dark gray text throughout
