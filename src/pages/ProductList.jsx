import { useEffect, useState } from "react";
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { deleteProduct, getAllProducts } from "@/services/productService";
import { toast } from "@/components/ui/toast";

const PAGE_SIZE = 10;

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });

  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchProducts = async () => {
      try {
        const data = await getAllProducts(page, PAGE_SIZE);
        if (!isCurrentRequest) return;

        if (data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
          setPage(data.pagination.totalPages);
          return;
        }

        setProducts(data.products);
        setPagination(data.pagination);
      } catch (error) {
        if (isCurrentRequest) {
          console.error("Failed to fetch products:", error);
        }
      }
    };

    fetchProducts();
    return () => {
      isCurrentRequest = false;
    };
  }, [page, refresh]);

  // Search and sort the products before applying pagination.
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const sortedProducts = [...filteredProducts].sort((first, second) => {
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
  const pageCount = Math.max(1, pagination.totalPages);
  const currentPage = pagination.currentPage;
  const pageProducts = sortedProducts;

  const toggleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const renderSortHeader = (label, key) => (
    <Button variant="ghost" className="-ml-3" onClick={() => toggleSort(key)}>
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  // Delete product handler (Dummy function)
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.add({
        type: "success",
        description: "The product has been successfully deleted.",
      });
      setRefresh((current) => current + 1);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.add({
        type: "error",
        description: "Failed to delete product. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Product Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Products Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your store inventory, prices, and stock statuses.
          </p>
        </div>
        <Link to="/dashboard/addproduct">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
      </div>

      {/* Data Table Container */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">
                {renderSortHeader("Product Name", "title")}
              </TableHead>
              <TableHead>
                {renderSortHeader("Base Price", "basePrice")}
              </TableHead>
              <TableHead>
                {renderSortHeader("Discounted Price", "discountPrice")}
              </TableHead>
              <TableHead>{renderSortHeader("Stock", "stock")}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageProducts.length > 0 ? (
              pageProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">
                    <div className="font-semibold">{product.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.sku}
                    </div>
                  </TableCell>
                  <TableCell>${product.basePrice.toFixed(2)}</TableCell>
                  <TableCell>${product.discountPrice.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>

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
                            onClick={() =>
                              navigate(`/dashboard/editproduct/${product._id}`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(product._id)}
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
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {`Showing ${sortedProducts.length} products on this page · ${pagination.totalProducts} products total`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
