package com.icecreamhub.repository;

import com.icecreamhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    boolean existsBySupplierId(Long supplierId);

    /** Detach order history from a menu item before it is deleted (names/prices are snapshotted). */
    @Modifying
    @Query("update OrderItem oi set oi.iceCream = null where oi.iceCream.id = :iceCreamId")
    void detachIceCream(@Param("iceCreamId") Long iceCreamId);
}
