import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrders } from "@/services/orderService";

const PAGE_SIZE = 10;

const statusStyles = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Processing: "border-blue-200 bg-blue-50 text-blue-700",
  Shipped: "border-violet-200 bg-violet-50 text-violet-700",
  Delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-red-200 bg-red-50 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsedDate);
};

const formatMoney = (amount, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to load orders. Please try again.";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setQuery(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchOrders = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const result = await getOrders(page, PAGE_SIZE, query);
        if (!isCurrentRequest) return;

        const nextPage = result.pagination.totalPages
          ? Math.min(page, result.pagination.totalPages)
          : 1;
        if (nextPage !== page) {
          setPage(nextPage);
          return;
        }

        setOrders(result.orders);
        setPagination(result.pagination);
      } catch (error) {
        if (isCurrentRequest) {
          console.error("Failed to fetch orders:", error);
          setErrorMessage(getErrorMessage(error));
          setOrders([]);
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isCurrentRequest = false;
    };
  }, [page, query, refresh]);

  const visibleOrders =
    statusFilter === "All statuses"
      ? orders
      : orders.filter((order) => order.orderStatus === statusFilter);
  const totalPages = Math.max(1, pagination.totalPages);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage customer orders.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search orders"
            className="pl-8"
            maxLength={100}
            placeholder="Search order, customer, or email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Status</span>
          <select
            aria-label="Filter orders by status"
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option>All statuses</option>
            {Object.keys(statusStyles).map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  className="h-28 text-center text-muted-foreground"
                  colSpan={8}
                >
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : errorMessage ? (
              <TableRow>
                <TableCell className="h-28 text-center" colSpan={8}>
                  <p className="mb-2 text-sm text-destructive">{errorMessage}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRefresh((current) => current + 1)}
                  >
                    Try again
                  </Button>
                </TableCell>
              </TableRow>
            ) : visibleOrders.length ? (
              visibleOrders.map((order) => {
                const customerName =
                  order.userInfo?.fullName || order.user?.name || "Customer";
                const itemCount = (order.orderItems || []).reduce(
                  (count, item) => count + (Number(item.qty) || 0),
                  0,
                );
                const isRefunded =
                  order.orderStatus === "Cancelled" &&
                  order.paymentStatus === "Refunded";

                return (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Link
                        className={`font-semibold hover:underline ${isRefunded ? "text-muted-foreground line-through" : ""}`}
                        to={`/dashboard/orders/${encodeURIComponent(order._id)}`}
                      >
                        #{order.orderNumber || order._id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${isRefunded ? "text-muted-foreground line-through" : ""}`}>
                        {customerName}
                      </div>
                    </TableCell>
                    <TableCell className={`text-muted-foreground  ${isRefunded ? "text-muted-foreground line-through" : ""}`}>
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell  className={`text-muted-foreground  ${isRefunded ? "text-muted-foreground line-through" : ""}`}>
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {isRefunded ? (
                        <div className="space-y-0.5">
                          <div className="text-muted-foreground line-through">
                            {formatMoney(
                              order.originalTotalPrice ?? order.totalPrice,
                              order.currency,
                            )}
                          </div>
                          <div>{formatMoney(0, order.currency)}</div>
                        </div>
                      ) : (
                        formatMoney(order.totalPrice, order.currency)
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{order.paymentMethod || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.paymentStatus || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusStyles[order.orderStatus] ||
                          "border-border bg-muted text-muted-foreground"
                        }
                      >
                        {order.orderStatus || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={
                          <Link
                            to={`/dashboard/orders/${encodeURIComponent(order._id)}`}
                          />
                        }
                        variant="ghost"
                        size="icon"
                        aria-label={`View order ${order.orderNumber || order._id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  className="h-28 text-center text-muted-foreground"
                  colSpan={8}
                >
                  {orders.length
                    ? "No orders match this status."
                    : "No orders found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.totalOrders
              ? `Showing ${visibleOrders.length} of ${pagination.totalOrders} orders`
              : "No orders to display"}
          </p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pagination.totalOrders ? pagination.currentPage : 0} of{" "}
              {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={loading || pagination.currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={loading || pagination.currentPage >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
