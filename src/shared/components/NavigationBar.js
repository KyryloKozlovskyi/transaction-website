import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { useAdmin } from "../../features/auth/contexts/AdminContext";

const NavigationBar = () => {
  const { isAdmin, logout } = useAdmin();

  const navbarStyle = {
    backgroundColor: "#1E90FF",
    borderBottom: "2px solid #FFD700",
  };

  const brandStyle = {
    color: "#FFFFFF",
    fontWeight: "bold",
  };

  const linkStyle = {
    color: "#FFFFFF",
  };

  const buttonPrimaryStyle = {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
    color: "#333333",
  };

  const buttonOutlineStyle = {
    borderColor: "#FFFFFF",
    color: "#FFFFFF",
  };

  return (
    <Navbar expand="lg" className="navbar" style={navbarStyle}>
      <Container>
        <Navbar.Brand href="/" className="navbar-brand" style={brandStyle}>
          <strong>Transaction</strong> Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/" className="nav-link" style={linkStyle}>
              Home
            </Nav.Link>
            <Nav.Link href="/about" className="nav-link" style={linkStyle}>
              About
            </Nav.Link>
            <Nav.Link href="/submit" className="nav-link" style={linkStyle}>
              Submit
            </Nav.Link>
          </Nav>
          <Nav className="align-items-lg-center">
            {isAdmin ? (
              <>
                <Nav.Link href="/admin" className="nav-link" style={linkStyle}>
                  <span className="d-inline-flex align-items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
                    </svg>
                    Admin
                  </span>
                </Nav.Link>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={logout}
                  className="ms-lg-2"
                  style={buttonOutlineStyle}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                href="/login"
                style={buttonPrimaryStyle}
              >
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
