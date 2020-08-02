import {
  Box,
  IconButton,
  Menu,
  MenuItem, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const ActionsDropdown = ({ deleteOrganization, organization }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            Alert("Havent implemented yet");
            handleClose();
          }
        }
        >
          Update organization
        </MenuItem>
        <MenuItem
          color="error.main"
          onClick={() => {
            if (
              confirm(
                `Are you sure you would like to delete organization ${organization.name}?`
              )
            )
              deleteOrganization({
                variables: { organizationId: organization.id },
              });
          }}
        >
          <Box color="error.main">Delete</Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ({ organizations, deleteOrganization }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subdomain</TableCell>
              <TableCell>Custom Domain</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell component="th" scope="row">
                  {organization.name}
                </TableCell>
                <TableCell component="th" scope="row">
                  {organization.subdomain}
                </TableCell>
                <TableCell component="th" scope="row">
                  {organization.customDomain}
                </TableCell>
                <TableCell align="right" padding="none">
                  <ActionsDropdown
                    organization={organization}
                    deleteOrganization={deleteOrganization}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
