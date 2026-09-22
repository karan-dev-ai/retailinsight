package com.retailinsight.repository;

import com.retailinsight.model.WholesaleListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WholesaleListingRepository extends JpaRepository<WholesaleListing, Long> {

    List<WholesaleListing> findByWholesalerId(Long wholesalerId);

    List<WholesaleListing> findByCategory(String category);

    @Query("SELECT w FROM WholesaleListing w WHERE " +
           "LOWER(w.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.wholesalerName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<WholesaleListing> searchListings(@Param("query") String query);

    @Query("SELECT DISTINCT w.category FROM WholesaleListing w")
    List<String> findDistinctCategories();
}
