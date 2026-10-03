package com.icecreamhub.dto;

import com.icecreamhub.model.IceCream;
import com.icecreamhub.model.Order;
import com.icecreamhub.model.OrderItem;
import com.icecreamhub.model.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class OrderDtos {

    private OrderDtos() {}

    public record CartItem(
            @NotNull Long iceCreamId,
            @Min(1) @Max(50) int quantity) {}

    public record PlaceOrderRequest(
            @NotNull Long supplierId,
            @NotEmpty @Valid List<CartItem> items,
            @NotBlank String deliveryAddress,
            String phone,
            @NotBlank String paymentMethod,
            String notes) {}

    public record UpdateStatusRequest(@NotNull OrderStatus status) {}

    public record OrderItemResponse(Long iceCreamId, String name, String imageUrl, BigDecimal unitPrice, int quantity,
                                    BigDecimal lineTotal) {
        public static OrderItemResponse from(OrderItem i) {
            IceCream ic = i.getIceCream();
            return new OrderItemResponse(
                    ic == null ? null : ic.getId(),
                    i.getName(), ic == null ? null : ic.getImageUrl(), i.getUnitPrice(), i.getQuantity(),
                    i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
        }
    }

    public record OrderResponse(
            Long id, Long supplierId, String supplierName, String customerName, String customerEmail,
            List<OrderItemResponse> items, String status,
            BigDecimal itemsTotal, BigDecimal deliveryFee, BigDecimal taxes, BigDecimal grandTotal,
            String deliveryAddress, String phone, String paymentMethod, String notes,
            Instant createdAt, Instant updatedAt) {

        public static OrderResponse from(Order o) {
            return new OrderResponse(o.getId(), o.getSupplier().getId(), o.getSupplier().getName(),
                    o.getUser().getName(), o.getUser().getEmail(),
                    o.getItems().stream().map(OrderItemResponse::from).toList(),
                    o.getStatus().name(), o.getItemsTotal(), o.getDeliveryFee(), o.getTaxes(), o.getGrandTotal(),
                    o.getDeliveryAddress(), o.getPhone(), o.getPaymentMethod(), o.getNotes(),
                    o.getCreatedAt(), o.getUpdatedAt());
        }
    }
}
