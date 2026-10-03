package com.icecreamhub.controller;

import com.icecreamhub.dto.CatalogDtos.*;
import com.icecreamhub.service.CatalogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    /** GET /api/suppliers?q=mango&city=Chennai&sort=rating|delivery|fee */
    @GetMapping("/suppliers")
    public List<SupplierSummary> suppliers(@RequestParam(required = false) String q,
                                           @RequestParam(required = false) String city,
                                           @RequestParam(required = false) String sort) {
        return catalogService.searchSuppliers(q, city, sort);
    }

    @GetMapping("/suppliers/{id}")
    public SupplierDetail supplier(@PathVariable Long id) {
        return catalogService.getSupplier(id);
    }

    @GetMapping("/cities")
    public List<String> cities() {
        return catalogService.cities();
    }
}
