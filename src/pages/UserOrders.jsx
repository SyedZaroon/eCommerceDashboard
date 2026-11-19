import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrdersByUser } from "@/services/orderService";

const PAGE_SIZE = 10;

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

export default function UserOrders() {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getOrdersByUser(userId, page, PAGE_SIZE);
        if (active) {
          setOrders(result.orders);
          setPagination(result.pagination);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load this user's orders.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      active = false;
    };
  }, [page, userId]);

  return (
    <div className="space-y-6">
      <Button
        render={<Link to="/dashboard/userlist" />}
        variant="ghost"
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User order history</h1>
        <p className="text-sm text-muted-foreground">
          Orders associated with this customer account.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell className="h-28 text-center text-muted-foreground" colSpan={6}>
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell className="h-28 text-center text-destructive" colSpan={6}>
                  {error}
                </TableCell>
              </TableRow>
            ) : orders.length ? (
              orders.map((order) => {
                const refunded =
                  order.orderStatus === "Cancelled" &&
                  order.paymentStatus === "Refunded";
                const itemCount = (order.orderItems || []).reduce(
                  (count, item) => count + (Number(item.qty) || 0),
                  0,
                );
                return (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Link
                        className="font-semibold hover:underline"
                        to={`/dashboard/orders/${encodeURIComponent(order._id)}`}
                      >
                        #{order.orderNumber || order._id}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{itemCount}</TableCell>
                    <TableCell>
                      {refunded && (
                        <div className="text-muted-foreground line-through">
                          {formatMoney(
                            order.originalTotalPrice ?? order.totalPrice,
                            order.currency,
                          )}
                        </div>
                      )}
                      {formatMoney(order.totalPrice, order.currency)}
                    </TableCell>
                    <TableCell>{order.paymentStatus || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.orderStatus || "Unknown"}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell className="h-28 text-center text-muted-foreground" colSpan={6}>
                  No orders are associated with this account.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.totalOrders
              ? `${pagination.totalOrders} orders`
              : "No orders"}
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
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={loading || page >= pagination.totalPages}
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
