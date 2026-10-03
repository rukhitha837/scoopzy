package com.icecreamhub.repository;

import com.icecreamhub.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    /** Matches suppliers by name, tags, or any ice cream they sell. Empty strings mean "no filter". */
    @Query("""
            select distinct s from Supplier s left join s.iceCreams i
            where (:q = ''
                   or lower(s.name) like lower(concat('%', :q, '%'))
                   or lower(s.tags) like lower(concat('%', :q, '%'))
                   or lower(i.name) like lower(concat('%', :q, '%'))
                   or lower(i.category) like lower(concat('%', :q, '%')))
              and (:city = '' or lower(s.city) = lower(:city))
            """)
    List<Supplier> search(@Param("q") String q, @Param("city") String city);

    @Query("select distinct s.city from Supplier s where s.city is not null order by s.city")
    List<String> findAllCities();
}
