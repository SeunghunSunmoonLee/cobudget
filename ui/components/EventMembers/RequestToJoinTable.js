import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Avatar from "../Avatar";
import Button from "../Button";

const RequestToJoinTable = ({
  requestsToJoin,
  updateMember,
  deleteMember,
  collection,
}) => {
  if (requestsToJoin.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl mb-3 font-semibold">
          {requestsToJoin.length} requests to join
        </h2>
        <div className="bg-white rounded-lg shadow">
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Bio</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestsToJoin.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell component="th" scope="row">
                      <div className="flex space-x-3">
                        <Avatar user={member.user} />
                        <div>
                          <p className="font-medium text-base">{member.name}</p>
                          <p className="text-gray-700 text-sm">
                            @{member.user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell component="th" scope="row">
                      {member.bio}
                    </TableCell>
                    <TableCell align="right" padding="none">
                      <Box p="0 15px" display="flex" justifyContent="flex-end">
                        <Box m="0 8px 0">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you would like to delete this membership request?"
                                )
                              )
                                deleteMember({
                                  collectionId: collection.id,
                                  memberId: member.id,
                                });
                            }}
                          >
                            Delete
                          </Button>
                        </Box>

                        <Button
                          // variant="primary"
                          onClick={() => {
                            if (
                              confirm("Are you sure you would like to approve?")
                            )
                              updateMember({
                                collectionId: collection.id,
                                memberId: member.id,
                                isApproved: true,
                              });
                          }}
                        >
                          Approve
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
};

export default RequestToJoinTable;
