package com.icecreamhub.dto;

import com.icecreamhub.model.IceCream;
import com.icecreamhub.model.Supplier;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public final class CatalogDtos {

    private CatalogDtos() {}

    public record SupplierSummary(
            Long id, String name, String description, String imageUrl, List<String> tags,
            String address, String city, double rating, int deliveryTimeMins,
            BigDecimal deliveryFee, BigDecimal minOrderAmount, boolean open) {

        public static SupplierSummary from(Supplier s) {
            return new SupplierSummary(s.getId(), s.getName(), s.getDescription(), s.getImageUrl(),
                    splitTags(s.getTags()), s.getAddress(), s.getCity(), s.getRating(), s.getDeliveryTimeMins(),
                    s.getDeliveryFee(), s.getMinOrderAmount(), s.isOpen());
        }
    }

    public record SupplierDetail(SupplierSummary supplier, List<IceCreamResponse> menu) {}

    public record IceCreamResponse(
            Long id, String name, String description, String category, BigDecimal price,
            String imageUrl, boolean veg, boolean available, boolean bestseller, Long supplierId) {

        public static IceCreamResponse from(IceCream i) {
            return new IceCreamResponse(i.getId(), i.getName(), i.getDescription(), i.getCategory(), i.getPrice(),
                    i.getImageUrl(), i.isVeg(), i.isAvailable(), i.isBestseller(), i.getSupplier().getId());
        }
    }

    public record SupplierRequest(
            @NotBlank String name,
            String description,
            String imageUrl,
            String tags,
            String address,
            @NotBlank String city,
            double rating,
            int deliveryTimeMins,
            @NotNull @DecimalMin("0") BigDecimal deliveryFee,
            @NotNull @DecimalMin("0") BigDecimal minOrderAmount,
            boolean open) {}

    public record IceCreamRequest(
            @NotBlank String name,
            String description,
            String category,
            @NotNull @DecimalMin("0.01") BigDecimal price,
            String imageUrl,
            boolean veg,
            boolean available,
            boolean bestseller) {}

    private static List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) return List.of();
        return List.of(tags.split("\\s*,\\s*"));
    }
}
