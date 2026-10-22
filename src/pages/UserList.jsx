import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  Trash2,
  Mail,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { deleteUser, getAllUsers, updateUser } from "@/services/userService";
import { toast } from "@/components/ui/toast"

const PAGE_SIZE = 10;



export default function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Search and sort users before applying pagination.
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const sortedUsers = [...filteredUsers].sort((first, second) => {
    const firstValue = first[sortConfig.key] ?? "";
    const secondValue = second[sortConfig.key] ?? "";
    const comparison =
      typeof firstValue === "number" && typeof secondValue === "number"
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });

    return sortConfig.direction === "asc" ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageUsers = sortedUsers.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const toggleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(0);
  };

  const renderSortHeader = (label, key) => (
    <Button
      variant="ghost"
      className="-ml-3"
      onClick={() => toggleSort(key)}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  // Delete user handler
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      toast.add({
        type: "success",
        description: "The user has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.add({
        type: "error",
        description: "Failed to delete the user. Please try again.",
      });
    } finally {
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    }
  };

const toggleActiveStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      await updateUser(userId, { status: newStatus });
      toast.add({
        type: "success",
        description: `User status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: currentStatus } : user
        )
      );
      toast.add({
        type: "error",
        description: "Failed to update status. Changes reverted.",
      });
    }
    finally {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add User Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage store users, assign roles, and monitor account statuses.
          </p>
        </div>
        <Link to="/dashboard/adduser">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="pl-8"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{renderSortHeader("User Name", "name")}</TableHead>
              <TableHead>{renderSortHeader("Role", "role")}</TableHead>
              <TableHead>{renderSortHeader("Status", "status")}</TableHead>
              <TableHead>
                {renderSortHeader("Joined Date", "joinedDate")}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageUsers.length > 0 ? (
              pageUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 w-fit"
                    >
                      <Shield className="h-3 w-3" /> {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.joinedDate.split("T")[0]}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
  
                          <DropdownMenuItem
                            onClick={() => toggleActiveStatus(user._id, user.status)}
                          >
                            { user.status === "Active" ? "Deactivate" : "Activate" }
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(user._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {sortedUsers.length === 0
              ? "No users"
              : `Showing ${currentPage * PAGE_SIZE + 1}-${Math.min(
                  (currentPage + 1) * PAGE_SIZE,
                  sortedUsers.length
                )} of ${sortedUsers.length} users`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
