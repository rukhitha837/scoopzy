package com.icecreamhub.controller;

import com.icecreamhub.dto.CatalogDtos.*;
import com.icecreamhub.dto.OrderDtos.*;
import com.icecreamhub.service.CatalogService;
import com.icecreamhub.service.ImageStorageService;
import com.icecreamhub.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/** All routes here require ROLE_ADMIN (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CatalogService catalogService;
    private final OrderService orderService;
    private final ImageStorageService imageStorageService;

    public AdminController(CatalogService catalogService, OrderService orderService,
                           ImageStorageService imageStorageService) {
        this.catalogService = catalogService;
        this.orderService = orderService;
        this.imageStorageService = imageStorageService;
    }

    @PostMapping("/suppliers")
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierSummary createSupplier(@Valid @RequestBody SupplierRequest req) {
        return catalogService.createSupplier(req);
    }

    @PutMapping("/suppliers/{id}")
    public SupplierSummary updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierRequest req) {
        return catalogService.updateSupplier(id, req);
    }

    @DeleteMapping("/suppliers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSupplier(@PathVariable Long id) {
        catalogService.deleteSupplier(id);
    }

    @PostMapping("/suppliers/{supplierId}/ice-creams")
    @ResponseStatus(HttpStatus.CREATED)
    public IceCreamResponse addIceCream(@PathVariable Long supplierId, @Valid @RequestBody IceCreamRequest req) {
        return catalogService.addIceCream(supplierId, req);
    }

    @PutMapping("/ice-creams/{id}")
    public IceCreamResponse updateIceCream(@PathVariable Long id, @Valid @RequestBody IceCreamRequest req) {
        return catalogService.updateIceCream(id, req);
    }

    @DeleteMapping("/ice-creams/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIceCream(@PathVariable Long id) {
        catalogService.deleteIceCream(id);
    }

    /** Upload a product/supplier image; returns {"url": "/uploads/<file>"} to put in imageUrl. */
    @PostMapping(path = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file) {
        return Map.of("url", imageStorageService.store(file));
    }

    @GetMapping("/orders")
    public List<OrderResponse> allOrders() {
        return orderService.allOrders();
    }

    @PatchMapping("/orders/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req) {
        return orderService.updateStatus(id, req.status());
    }
}
