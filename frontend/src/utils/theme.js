// theme.js
export const theme = {
  colors: {
    brand: {
      primary: "#87D748",
      primaryHover: "#76C33D",
      onPrimary: "#040903"
    },
    neutrals: {
      white: "#FFFFFF",
      black: "#040903",
      gray50: "#F8FAF7",
      gray100: "#E9ECE7",
      gray500: "#777C85",
      gray900: "#0D120B"
    },
    feedback: {
      success: "#87D748",
      warning: "#FFB800",
      error: "#FF4D4D",
      info: "#20D1FD"
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    scales: {
      display: "48px",
      h1: "32px",
      h2: "24px",
      body: "16px",
      caption: "12px"
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    unit: 4,
    scales: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "40px",
      xxl: "64px"
    }
  },
  borders: {
    radius: {
      sm: "4px",
      md: "8px",
      lg: "16px",
      full: "9999px"
    },
    width: {
      thin: "1px",
      thick: "2px"
    }
  },
  shadows: {
    soft: "0 4px 20px rgba(0, 0, 0, 0.04)",
    medium: "0 8px 30px rgba(0, 0, 0, 0.08)",
    strong: "0 12px 40px rgba(0, 0, 0, 0.12)"
  }
};

// Common style generators
export const createStyles = {
  // Layout styles
  container: (bgColor = theme.colors.neutrals.gray50) => ({
    minHeight: "100vh",
    backgroundColor: bgColor,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: `${theme.spacing.scales.lg} ${theme.spacing.scales.md}`,
    fontFamily: theme.typography.fontFamily
  }),

  // Logo section
  logoSection: (maxWidth = "400px", marginBottom = theme.spacing.scales.xl) => ({
    margin: "0 auto",
    width: "100%",
    maxWidth: maxWidth,
    textAlign: "center",
    marginBottom: marginBottom
  }),

  logo: (size = "64px", bgColor = theme.colors.brand.primary) => ({
    width: size,
    height: size,
    backgroundColor: bgColor,
    borderRadius: theme.borders.radius.lg,
    margin: `0 auto ${theme.spacing.scales.md}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.brand.onPrimary,
    fontSize: theme.typography.scales.h1
  }),

  // Typography
  heading: (level = "h1", color = theme.colors.neutrals.gray900) => ({
    fontSize: theme.typography.scales[level],
    fontWeight: theme.typography.weights.bold,
    color: color,
    marginBottom: theme.spacing.scales.sm,
    lineHeight: 1.2
  }),

  subtitle: (color = theme.colors.neutrals.gray500) => ({
    fontSize: theme.typography.scales.body,
    fontWeight: theme.typography.weights.regular,
    color: color,
    lineHeight: 1.5
  }),

  // Card
  card: (maxWidth = "400px", padding = theme.spacing.scales.xl) => ({
    backgroundColor: theme.colors.neutrals.white,
    borderRadius: theme.borders.radius.lg,
    padding: padding,
    maxWidth: maxWidth,
    width: "100%",
    margin: "0 auto",
    boxShadow: theme.shadows.medium
  }),

  // Form
  form: (gap = theme.spacing.scales.lg) => ({
    display: "flex",
    flexDirection: "column",
    gap: gap
  }),

  // Labels
  label: (color = theme.colors.neutrals.gray900) => ({
    display: "block",
    fontSize: "14px",
    fontWeight: theme.typography.weights.semibold,
    color: color,
    marginBottom: theme.spacing.scales.sm
  }),

  // Input containers
  inputContainer: () => ({
    position: "relative"
  }),

  inputIcon: (color = theme.colors.neutrals.gray500) => ({
    position: "absolute",
    left: theme.spacing.scales.md,
    top: "50%",
    transform: "translateY(-50%)",
    color: color,
    fontSize: "20px",
    pointerEvents: "none"
  }),

  // Input fields
  input: (hasError = false) => ({
    width: "100%",
    padding: `${theme.spacing.scales.sm} ${theme.spacing.scales.sm} ${theme.spacing.scales.sm} 48px`,
    fontSize: theme.typography.scales.body,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.neutrals.gray900,
    backgroundColor: theme.colors.neutrals.white,
    border: `${theme.borders.width.thick} solid ${hasError ? theme.colors.feedback.error : theme.colors.neutrals.gray100}`,
    borderRadius: theme.borders.radius.md,
    outline: "2px solid #87D748",
    transition: "all 0.2s ease",
    "&:focus": {
      borderColor: theme.colors.brand.primary,
      boxShadow: `0 0 0 3px ${theme.colors.brand.primary}1A`
    }
  }),

  // Buttons
  primaryButton: (disabled = false) => ({
    width: "100%",
    padding: theme.spacing.scales.md,
    fontSize: theme.typography.scales.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.brand.onPrimary,
    backgroundColor: disabled ? `${theme.colors.brand.primary}99` : theme.colors.brand.primary,
    border: "none",
    borderRadius: theme.borders.radius.md,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.scales.sm,
    "&:hover:not(:disabled)": {
      backgroundColor: theme.colors.brand.primaryHover,
      transform: "translateY(-1px)",
      boxShadow: `0 4px 12px ${theme.colors.brand.primary}33`
    }
  }),

  secondaryButton: () => ({
    width: "100%",
    padding: theme.spacing.scales.md,
    fontSize: "14px",
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.neutrals.gray900,
    backgroundColor: theme.colors.neutrals.white,
    border: `${theme.borders.width.thick} solid ${theme.colors.neutrals.gray100}`,
    borderRadius: theme.borders.radius.md,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      borderColor: theme.colors.brand.primary,
      backgroundColor: theme.colors.neutrals.gray50
    }
  }),

  // Checkbox
  checkbox: (checked = false, hasError = false) => ({
    appearance: "none",
    width: "20px",
    height: "20px",
    border: `${theme.borders.width.thick} solid ${hasError ? theme.colors.feedback.error : theme.colors.neutrals.gray100}`,
    borderRadius: theme.borders.radius.sm,
    backgroundColor: checked ? theme.colors.brand.primary : theme.colors.neutrals.white,
    cursor: "pointer",
    position: "relative",
    transition: "all 0.2s ease",
    flexShrink: 0,
    marginTop: "2px",
  }),

  checkboxIconContainer: () =>( {
    position: "relative",
    width: "20px",
    height: "24px"
  }),

  checkboxIcon: () => ({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: theme.colors.brand.onPrimary,
    fontSize: "14px",
    pointerEvents: "none"
  }),

  checkboxLabel: () => ({
    fontSize: "14px",
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.neutrals.gray900,
    cursor: "pointer",
    lineHeight: 1.4
  }),

  // Links
  link: () => ({
    fontSize: "14px",
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.brand.primary,
    textDecoration: "none",
    transition: "color 0.2s ease",
    "&:hover": {
      color: theme.colors.brand.primaryHover
    }
  }),

  // Error text
  errorText: () => ({
    fontSize: "14px",
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.feedback.error,
    marginTop: theme.spacing.scales.xs,
    marginLeft: theme.spacing.scales.xs
  }),

  // Divider
  divider: () => ({
    position: "relative",
    textAlign: "center",
    margin: `${theme.spacing.scales.lg} 0`
  }),

  dividerLine: () => ({
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: theme.borders.width.thin,
    backgroundColor: theme.colors.neutrals.gray100
  }),

  dividerText: () => ({
    position: "relative",
    display: "inline-block",
    padding: `0 ${theme.spacing.scales.md}`,
    backgroundColor: theme.colors.neutrals.white,
    fontSize: "14px",
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.neutrals.gray500
  }),

  // Grid
  grid: () => ({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: theme.spacing.scales.lg,
    "@media (min-width: 768px)": {
      gridTemplateColumns: "1fr 1fr"
    }
  }),

  // Password toggle
  passwordToggle: () => ({
    position: "absolute",
    right: theme.spacing.scales.md,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: theme.colors.neutrals.gray500,
    cursor: "pointer",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.scales.xs,
    transition: "color 0.2s ease",
    "&:hover": {
      color: theme.colors.neutrals.gray900
    }
  })
};