package com.icecreamhub.repository;

import com.icecreamhub.model.IceCream;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IceCreamRepository extends JpaRepository<IceCream, Long> {
    List<IceCream> findBySupplierIdOrderByIdAsc(Long supplierId);
}
