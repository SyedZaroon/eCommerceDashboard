import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  createCollection,
  deleteCollection,
  getAllCollections,
} from "@/services/productCollectionService";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

export default function AddCollection() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [addCollectionState, setAddCollectionState] = useState({
    collectionname: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddCollectionState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCollection = await createCollection(addCollectionState);
      setCollections((prev) => [...prev, newCollection]);
      toast.add({
        type: "success",
        description: "Collection has been created successfully.",
      });
      setAddCollectionState({ collectionname: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.add({
        type: "error",
        description:
          error.response?.data?.message || "Failed to create collection. Please try again.",
      });
    }
  };

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = await getAllCollections();
        console.log("Product Collections",data);
        setCollections(data);
      } catch (error) {
        console.error("Failed to fetch Collection:", error);
      }
    };

    fetchCollection();
  }, []);


  // Delete collection handler
  const handleDelete = async (id) => {
    try {
      await deleteCollection(id)
      toast.add({
        type: "success",
        description: "The collection has been successfully deleted.",
      });
      setCollections((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete collection:", error);
      toast.add({
        type: "error",
        description: "Failed to delete collection. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="space-y-6 py-6">
        {/* Top Header & Add Collection Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Collection Management
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Collection</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Collection</DialogTitle>
                  <DialogDescription>
                    Create a new product collection.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-4">
                  <Field>
                    <Label htmlFor="name-1">Collection Name</Label>
                    <Input
                      onChange={handleInputChange}
                      id="name-1"
                      name="collectionname"
                      value={addCollectionState.collectionname}
                      required
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>


        {/* Data Table Container */}
        <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Collection Name</TableHead>
                 <TableHead>Total Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.length > 0 ? (
                collections.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      <div className="font-semibold">{item.collectionname}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="font-semibold">{item.productCount}</div>
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
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                    colSpan={2}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No Collection found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}