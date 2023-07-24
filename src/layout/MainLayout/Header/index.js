import PropTypes from "prop-types";

// material-ui
import { useTheme } from "@mui/material/styles";

// assets
import { useSelector } from "react-redux";

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
  const userData = useSelector((state) => state.auth.userData);

  return (
    <>
      {/* logo & toggler button */}

      {/* header search */}

      {/* notification & profile */}
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func,
};

export default Header;
