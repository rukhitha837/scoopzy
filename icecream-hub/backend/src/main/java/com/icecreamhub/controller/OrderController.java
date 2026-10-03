package com.icecreamhub.controller;

import com.icecreamhub.dto.OrderDtos.*;
import com.icecreamhub.security.AuthUser;
import com.icecreamhub.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@AuthenticationPrincipal AuthUser auth, @Valid @RequestBody PlaceOrderRequest req) {
        return orderService.placeOrder(auth.id(), req);
    }

    @GetMapping
    public List<OrderResponse> myOrders(@AuthenticationPrincipal AuthUser auth) {
        return orderService.myOrders(auth.id());
    }

    @GetMapping("/{id}")
    public OrderResponse get(@AuthenticationPrincipal AuthUser auth, @PathVariable Long id) {
        return orderService.getOrder(auth, id);
    }

    @PatchMapping("/{id}/cancel")
    public OrderResponse cancel(@AuthenticationPrincipal AuthUser auth, @PathVariable Long id) {
        return orderService.cancel(auth, id);
    }
}
