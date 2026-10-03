package com.icecreamhub.service;

import com.icecreamhub.dto.CatalogDtos.*;
import com.icecreamhub.exception.ApiException;
import com.icecreamhub.model.IceCream;
import com.icecreamhub.model.Supplier;
import com.icecreamhub.repository.IceCreamRepository;
import com.icecreamhub.repository.OrderRepository;
import com.icecreamhub.repository.SupplierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class CatalogService {

    private final SupplierRepository supplierRepository;
    private final IceCreamRepository iceCreamRepository;
    private final OrderRepository orderRepository;

    public CatalogService(SupplierRepository supplierRepository, IceCreamRepository iceCreamRepository,
                          OrderRepository orderRepository) {
        this.supplierRepository = supplierRepository;
        this.iceCreamRepository = iceCreamRepository;
        this.orderRepository = orderRepository;
    }

    // ---------- Public catalog ----------

    @Transactional(readOnly = true)
    public List<SupplierSummary> searchSuppliers(String q, String city, String sort) {
        Comparator<SupplierSummary> comparator = switch (sort == null ? "" : sort) {
            case "delivery" -> Comparator.comparingInt(SupplierSummary::deliveryTimeMins);
            case "fee" -> Comparator.comparing(SupplierSummary::deliveryFee);
            default -> Comparator.comparingDouble(SupplierSummary::rating).reversed();
        };
        return supplierRepository.search(blankToEmpty(q), blankToEmpty(city)).stream()
                .map(SupplierSummary::from)
                .sorted(comparator)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupplierDetail getSupplier(Long id) {
        Supplier s = findSupplier(id);
        List<IceCreamResponse> menu = s.getIceCreams().stream().map(IceCreamResponse::from).toList();
        return new SupplierDetail(SupplierSummary.from(s), menu);
    }

    @Transactional(readOnly = true)
    public List<String> cities() {
        return supplierRepository.findAllCities();
    }

    // ---------- Admin: suppliers ----------

    @Transactional
    public SupplierSummary createSupplier(SupplierRequest req) {
        Supplier s = new Supplier();
        apply(s, req);
        return SupplierSummary.from(supplierRepository.save(s));
    }

    @Transactional
    public SupplierSummary updateSupplier(Long id, SupplierRequest req) {
        Supplier s = findSupplier(id);
        apply(s, req);
        return SupplierSummary.from(s);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier s = findSupplier(id);
        if (orderRepository.existsBySupplierId(id)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This supplier has order history and cannot be deleted. Mark it as closed instead.");
        }
        supplierRepository.delete(s);
    }

    // ---------- Admin: ice creams ----------

    @Transactional
    public IceCreamResponse addIceCream(Long supplierId, IceCreamRequest req) {
        Supplier s = findSupplier(supplierId);
        IceCream i = new IceCream();
        i.setSupplier(s);
        apply(i, req);
        return IceCreamResponse.from(iceCreamRepository.save(i));
    }

    @Transactional
    public IceCreamResponse updateIceCream(Long id, IceCreamRequest req) {
        IceCream i = iceCreamRepository.findById(id).orElseThrow(() -> ApiException.notFound("Ice cream"));
        apply(i, req);
        return IceCreamResponse.from(i);
    }

    @Transactional
    public void deleteIceCream(Long id) {
        IceCream i = iceCreamRepository.findById(id).orElseThrow(() -> ApiException.notFound("Ice cream"));
        orderRepository.detachIceCream(id);
        i.getSupplier().getIceCreams().remove(i);
        iceCreamRepository.delete(i);
    }

    // ---------- helpers ----------

    private Supplier findSupplier(Long id) {
        return supplierRepository.findById(id).orElseThrow(() -> ApiException.notFound("Supplier"));
    }

    private static String blankToEmpty(String s) {
        return s == null ? "" : s.trim();
    }

    private static void apply(Supplier s, SupplierRequest r) {
        s.setName(r.name().trim());
        s.setDescription(r.description());
        s.setImageUrl(r.imageUrl());
        s.setTags(r.tags());
        s.setAddress(r.address());
        s.setCity(r.city().trim());
        s.setRating(Math.max(0, Math.min(5, r.rating())));
        s.setDeliveryTimeMins(Math.max(0, r.deliveryTimeMins()));
        s.setDeliveryFee(r.deliveryFee());
        s.setMinOrderAmount(r.minOrderAmount());
        s.setOpen(r.open());
    }

    private static void apply(IceCream i, IceCreamRequest r) {
        i.setName(r.name().trim());
        i.setDescription(r.description());
        i.setCategory(r.category());
        i.setPrice(r.price());
        i.setImageUrl(r.imageUrl());
        i.setVeg(r.veg());
        i.setAvailable(r.available());
        i.setBestseller(r.bestseller());
    }
}
