import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasPermission } from "@/authentication/hasPermission";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/toast";
import { getOrderById, updateOrder } from "@/services/orderService";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

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
        dateStyle: "long",
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
  error.response?.data?.message || "Unable to load this order. Please try again.";

function InfoLine({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children || "—"}</span>
    </div>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingField, setUpdatingField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchOrder = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const result = await getOrderById(id);
        if (isCurrentRequest) setOrder(result);
      } catch (error) {
        if (isCurrentRequest) {
          console.error("Failed to fetch order:", error);
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      isCurrentRequest = false;
    };
  }, [id, refresh]);

  const handleOrderUpdate = async (field, value) => {
    setUpdatingField(field);
    try {
      const updatedOrder = await updateOrder(id, { [field]: value });
      setOrder(updatedOrder);
      const updatedFields = [];
      if (updatedOrder.orderStatus !== order.orderStatus) {
        updatedFields.push(`Order status updated to ${updatedOrder.orderStatus}`);
      }
      if (updatedOrder.paymentStatus !== order.paymentStatus) {
        updatedFields.push(
          `Payment status updated to ${updatedOrder.paymentStatus}`,
        );
      }
      toast.add({
        type: "success",
        description: updatedFields.join(" | "),
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      toast.add({
        type: "error",
        description:
          error.response?.data?.message ||
          `Failed to update ${field === "orderStatus" ? "order" : "payment"} status. Please try again.`,
      });
    } finally {
      setUpdatingField("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button
          render={<Link to="/dashboard/orders" />}
          variant="ghost"
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Button>
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading order details...
        </div>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="space-y-6">
        <Button
          render={<Link to="/dashboard/orders" />}
          variant="ghost"
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Button>
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <p className="text-sm text-destructive">
              {errorMessage || "Order not found."}
            </p>
            <Button
              variant="outline"
              onClick={() => setRefresh((current) => current + 1)}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currency = order.currency || "PKR";
  const customerName =
    order.userInfo?.fullName || order.user?.name || "Customer";
  const items = order.orderItems || [];
  const itemCount = items.reduce(
    (count, item) => count + (Number(item.qty) || 0),
    0,
  );
  const canUpdateOrder = hasPermission(user, "ORDERS", "UPDATE");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button
            render={<Link to="/dashboard/orders" />}
            variant="ghost"
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Order #{order.orderNumber || order._id}
              </h1>
              <Badge
                variant="outline"
                className={
                  statusStyles[order.orderStatus] ||
                  "border-border bg-muted text-muted-foreground"
                }
              >
                {order.orderStatus || "Unknown"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        {canUpdateOrder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={Boolean(updatingField)} variant="outline">
                {updatingField === "orderStatus"
                  ? "Updating..."
                  : "Update order status"}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Set order status</DropdownMenuLabel>
                {ORDER_STATUSES.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={
                      Boolean(updatingField) || status === order.orderStatus
                    }
                    onClick={() => handleOrderUpdate("orderStatus", status)}
                  >
                    {status === order.orderStatus ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <span className="mr-2 h-4 w-4" />
                    )}
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Items ordered</CardTitle>
              <CardDescription>
                {itemCount} {itemCount === 1 ? "item" : "items"} in this order
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {items.map((item, index) => {
                const title = item.title || item.product?.title || "Product";
                const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
                return (
                  <div
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                    key={item._id || `${item.product?._id || title}-${index}`}
                  >
                    {item.productImg ? (
                      <img
                        src={item.productImg}
                        alt={title}
                        className="h-16 w-16 rounded-lg border object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{title}</p>
                      {item.product?.sku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.product.sku}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatMoney(item.price, currency)} × {item.qty}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatMoney(lineTotal, currency)}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {order.orderStatus === "Cancelled" &&
                order.paymentStatus === "Refunded" && (
                  <>
                    <InfoLine label="Original order">
                      <span className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                        {formatMoney(
                          order.originalTotalPrice ?? order.totalPrice,
                          currency,
                        )}
                      </span>
                    </InfoLine>
                    <div className="border-t" />
                  </>
                )}
              <InfoLine label="Items subtotal">
                {formatMoney(order.itemsPrice, currency)}
              </InfoLine>
              <InfoLine label="Shipping">
                {formatMoney(order.shippingPrice, currency)}
              </InfoLine>
              <InfoLine label="Shipping method">
                {order.shippingMethod === "next_day"
                  ? "Next Day Delivery"
                  : Number(order.shippingPrice) === 0
                    ? "Free Shipping"
                    : "Standard Delivery"}
              </InfoLine>
              <div className="border-t pt-3">
                <InfoLine label="Total">
                  <span className="text-base">
                    {formatMoney(order.totalPrice, currency)}
                  </span>
                </InfoLine>
              </div>
              {order.orderStatus === "Cancelled" &&
                order.paymentStatus === "Refunded" && (
                  <>
                    <div className="border-t" />
                    <InfoLine label="Paid">
                      {formatMoney(
                        order.originalTotalPrice ?? order.totalPrice,
                        currency,
                      )}
                    </InfoLine>
                    <InfoLine label="Refunded">
                      <span className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          Reason: “{order.refundReason || "Order canceled"}”
                        </span>
                        -{formatMoney(
                          order.refundedAmount ??
                            order.originalTotalPrice ??
                            order.totalPrice,
                          currency,
                        )}
                      </span>
                    </InfoLine>
                    <InfoLine label="Net payment">
                      {formatMoney(
                        Math.max(
                          0,
                          (order.originalTotalPrice ?? order.totalPrice ?? 0) -
                            (order.refundedAmount ??
                              order.originalTotalPrice ??
                              order.totalPrice ??
                              0),
                        ),
                        currency,
                      )}
                    </InfoLine>
                  </>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <InfoLine label="Name">{customerName}</InfoLine>
              <InfoLine label="Email">
                {order.userInfo?.email || order.user?.email}
              </InfoLine>
              <InfoLine label="Phone">
                {order.userInfo?.phoneNumber}
              </InfoLine>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <InfoLine label="Address">
                {order.shippingAddress?.address}
              </InfoLine>
              <InfoLine label="Town">{order.shippingAddress?.town}</InfoLine>
              <InfoLine label="Post code">
                {order.shippingAddress?.postCode}
              </InfoLine>
              <InfoLine label="Country">
                {order.shippingAddress?.country}
              </InfoLine>
              {order.shippingAddress?.additionalInfo && (
                <InfoLine label="Additional info">
                  {order.shippingAddress.additionalInfo}
                </InfoLine>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <InfoLine label="Method">{order.paymentMethod}</InfoLine>
              <InfoLine label="Payment status">
                <span className="inline-flex items-center gap-2">
                  <Badge variant="secondary">
                    {order.paymentStatus || "Pending"}
                  </Badge>
                  {canUpdateOrder && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          disabled={Boolean(updatingField)}
                          variant="outline"
                          size="sm"
                          aria-label="Update payment status"
                        >
                          {updatingField === "paymentStatus"
                            ? "Updating..."
                            : "Update"}
                          <ChevronDown className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>
                            Set payment status
                          </DropdownMenuLabel>
                          {PAYMENT_STATUSES.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={
                                Boolean(updatingField) ||
                                status === order.paymentStatus
                              }
                              onClick={() =>
                                handleOrderUpdate("paymentStatus", status)
                              }
                            >
                              {status === order.paymentStatus ? (
                                <Check className="mr-2 h-4 w-4" />
                              ) : (
                                <span className="mr-2 h-4 w-4" />
                              )}
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </span>
              </InfoLine>
              {order.paymentDetails?.transactionId && (
                <InfoLine label="Transaction ID">
                  {order.paymentDetails.transactionId}
                </InfoLine>
              )}
              {order.deliveredAt && (
                <InfoLine label="Delivered">
                  {formatDate(order.deliveredAt)}
                </InfoLine>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
