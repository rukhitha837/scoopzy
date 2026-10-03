package com.icecreamhub.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String imageUrl;

    /** Comma-separated tags, e.g. "Gelato,Vegan,Kulfi". */
    private String tags;

    private String address;

    private String city;

    private double rating;

    private int deliveryTimeMins;

    @Column(precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    private boolean open = true;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<IceCream> iceCreams = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public int getDeliveryTimeMins() { return deliveryTimeMins; }
    public void setDeliveryTimeMins(int deliveryTimeMins) { this.deliveryTimeMins = deliveryTimeMins; }
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    public boolean isOpen() { return open; }
    public void setOpen(boolean open) { this.open = open; }
    public List<IceCream> getIceCreams() { return iceCreams; }
    public void setIceCreams(List<IceCream> iceCreams) { this.iceCreams = iceCreams; }
}
