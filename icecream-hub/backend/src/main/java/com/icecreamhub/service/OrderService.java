package com.icecreamhub.service;

import com.icecreamhub.dto.OrderDtos.*;
import com.icecreamhub.exception.ApiException;
import com.icecreamhub.model.*;
import com.icecreamhub.repository.IceCreamRepository;
import com.icecreamhub.repository.OrderRepository;
import com.icecreamhub.repository.SupplierRepository;
import com.icecreamhub.repository.UserRepository;
import com.icecreamhub.security.AuthUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05");
    private static final Set<OrderStatus> CUSTOMER_CANCELLABLE = EnumSet.of(OrderStatus.PLACED, OrderStatus.CONFIRMED);
    private static final Set<OrderStatus> FINAL = EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED);

    private final OrderRepository orderRepository;
    private final SupplierRepository supplierRepository;
    private final IceCreamRepository iceCreamRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, SupplierRepository supplierRepository,
                        IceCreamRepository iceCreamRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.supplierRepository = supplierRepository;
        this.iceCreamRepository = iceCreamRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User"));
        Supplier supplier = supplierRepository.findById(req.supplierId())
                .orElseThrow(() -> ApiException.notFound("Supplier"));
        if (!supplier.isOpen()) {
            throw ApiException.badRequest(supplier.getName() + " is currently closed");
        }

        Map<Long, IceCream> menu = iceCreamRepository.findAllById(
                        req.items().stream().map(CartItem::iceCreamId).toList())
                .stream().collect(Collectors.toMap(IceCream::getId, Function.identity()));

        Order order = new Order();
        order.setUser(user);
        order.setSupplier(supplier);
        BigDecimal itemsTotal = BigDecimal.ZERO;

        for (CartItem ci : req.items()) {
            IceCream ic = menu.get(ci.iceCreamId());
            if (ic == null || !ic.getSupplier().getId().equals(supplier.getId())) {
                throw ApiException.badRequest("Item " + ci.iceCreamId() + " is not on this supplier's menu");
            }
            if (!ic.isAvailable()) {
                throw ApiException.badRequest(ic.getName() + " is currently unavailable");
            }
            OrderItem item = new OrderItem();
            item.setIceCream(ic);
            item.setName(ic.getName());
            item.setUnitPrice(ic.getPrice());
            item.setQuantity(ci.quantity());
            order.addItem(item);
            itemsTotal = itemsTotal.add(ic.getPrice().multiply(BigDecimal.valueOf(ci.quantity())));
        }

        if (itemsTotal.compareTo(supplier.getMinOrderAmount()) < 0) {
            throw ApiException.badRequest("Minimum order amount for " + supplier.getName()
                    + " is ₹" + supplier.getMinOrderAmount());
        }

        BigDecimal taxes = itemsTotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        order.setItemsTotal(itemsTotal);
        order.setDeliveryFee(supplier.getDeliveryFee());
        order.setTaxes(taxes);
        order.setGrandTotal(itemsTotal.add(supplier.getDeliveryFee()).add(taxes));
        order.setDeliveryAddress(req.deliveryAddress().trim());
        order.setPhone(req.phone());
        order.setPaymentMethod(req.paymentMethod());
        order.setNotes(req.notes());

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(AuthUser auth, Long orderId) {
        return OrderResponse.from(findAccessible(auth, orderId));
    }

    @Transactional
    public OrderResponse cancel(AuthUser auth, Long orderId) {
        Order order = findAccessible(auth, orderId);
        if (!CUSTOMER_CANCELLABLE.contains(order.getStatus())) {
            throw ApiException.badRequest("Order can no longer be cancelled (status: " + order.getStatus() + ")");
        }
        setStatus(order, OrderStatus.CANCELLED);
        return OrderResponse.from(order);
    }

    // ---------- Admin ----------

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(OrderResponse::from).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> ApiException.notFound("Order"));
        if (FINAL.contains(order.getStatus())) {
            throw ApiException.badRequest("Order is already " + order.getStatus());
        }
        setStatus(order, status);
        return OrderResponse.from(order);
    }

    private void setStatus(Order order, OrderStatus status) {
        order.setStatus(status);
        order.setUpdatedAt(Instant.now());
    }

    private Order findAccessible(AuthUser auth, Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> ApiException.notFound("Order"));
        if (auth.role() != Role.ADMIN && !order.getUser().getId().equals(auth.id())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }
}
