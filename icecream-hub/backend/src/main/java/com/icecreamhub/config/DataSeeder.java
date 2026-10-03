package com.icecreamhub.config;

import com.icecreamhub.model.IceCream;
import com.icecreamhub.model.Role;
import com.icecreamhub.model.Supplier;
import com.icecreamhub.model.User;
import com.icecreamhub.repository.SupplierRepository;
import com.icecreamhub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/** Seeds an admin user and sample suppliers/menus on first start. */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, SupplierRepository supplierRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!userRepository.existsByEmailIgnoreCase("admin@icecreamhub.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@icecreamhub.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Seeded admin user: admin@icecreamhub.com / admin123");
        }
        if (!userRepository.existsByEmailIgnoreCase("user@icecreamhub.com")) {
            User user = new User();
            user.setName("Demo User");
            user.setEmail("user@icecreamhub.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setPhone("9876543210");
            user.setAddress("12, Anna Salai, Chennai 600002");
            userRepository.save(user);
            log.info("Seeded demo user: user@icecreamhub.com / user123");
        }

        if (supplierRepository.count() > 0) {
            attachSampleImages();
            return;
        }

        Supplier s1 = supplier("Mango Meadows Creamery", "Fresh fruit ice creams made with seasonal Alphonso mangoes and real fruit pulp.",
                "Fruit,Natural,Bestseller", "T. Nagar", "Chennai", 4.6, 25, 30, 99);
        item(s1, "Alphonso Mango", "Creamy ice cream loaded with Alphonso mango pulp", "Cup", 120, true);
        item(s1, "Tender Coconut", "Light and refreshing with tender coconut bits", "Cup", 110, true);
        item(s1, "Sitaphal Delight", "Custard apple ice cream, a seasonal favourite", "Cup", 130, false);
        item(s1, "Strawberry Swirl", "Strawberry ice cream with a berry compote ripple", "Cone", 90, false);
        item(s1, "Family Pack Mango Tub", "1 litre tub of our signature mango ice cream", "Tub", 450, false);

        Supplier s2 = supplier("Kulfi Junction", "Traditional slow-cooked kulfis and falooda, the old-fashioned way.",
                "Kulfi,Falooda,Indian", "Mylapore", "Chennai", 4.4, 30, 20, 79);
        item(s2, "Malai Kulfi", "Rich reduced-milk kulfi on a stick", "Kulfi", 60, true);
        item(s2, "Kesar Pista Kulfi", "Saffron and pistachio kulfi", "Kulfi", 80, true);
        item(s2, "Royal Falooda", "Kulfi, rose syrup, sabja seeds and vermicelli", "Sundae", 160, false);
        item(s2, "Paan Kulfi", "Refreshing betel leaf flavoured kulfi", "Kulfi", 70, false);
        item(s2, "Matka Kulfi", "Served in a traditional clay pot", "Kulfi", 110, false);

        Supplier s3 = supplier("Gelato Bella", "Italian-style gelato churned fresh every morning.",
                "Gelato,Premium,Italian", "Indiranagar", "Bengaluru", 4.8, 35, 49, 149);
        item(s3, "Pistachio Gelato", "Made with Sicilian pistachio paste", "Gelato", 220, true);
        item(s3, "Hazelnut Gianduja", "Chocolate hazelnut gelato", "Gelato", 210, true);
        item(s3, "Stracciatella", "Fior di latte with dark chocolate shavings", "Gelato", 190, false);
        item(s3, "Lemon Sorbet", "Dairy-free, tangy and refreshing", "Gelato", 160, false);
        item(s3, "Affogato", "Vanilla gelato drowned in a shot of espresso", "Sundae", 240, false);

        Supplier s4 = supplier("Choco Bliss Parlour", "For chocolate lovers: brownies, sundaes and triple chocolate everything.",
                "Chocolate,Sundae,Desserts", "Koramangala", "Bengaluru", 4.3, 28, 35, 129);
        item(s4, "Death by Chocolate", "Brownie, chocolate ice cream, fudge and nuts", "Sundae", 260, true);
        item(s4, "Belgian Dark Chocolate", "Intense 70% dark chocolate scoop", "Cup", 150, true);
        item(s4, "Brownie Fudge Cone", "Waffle cone with brownie chunks", "Cone", 140, false);
        item(s4, "Choco Chip Cookie Dough", "Vanilla base with cookie dough bites", "Cup", 160, false);
        item(s4, "Hot Fudge Sundae", "Classic vanilla with warm fudge sauce", "Sundae", 180, false);

        Supplier s5 = supplier("Vegan Swirl", "100% plant-based ice creams made with coconut and almond milk.",
                "Vegan,Healthy,Sugar-free", "Bandra West", "Mumbai", 4.5, 32, 40, 149);
        item(s5, "Coconut Caramel", "Coconut milk base with salted date caramel", "Cup", 180, true);
        item(s5, "Almond Mocha", "Almond milk, cold brew and cacao nibs", "Cup", 190, false);
        item(s5, "Berry Blast Sorbet", "Mixed berries, no added sugar", "Cup", 170, false);
        item(s5, "Peanut Butter Choc", "Peanut butter swirl with dark chocolate", "Tub", 420, false);

        Supplier s6 = supplier("Polar Bites", "Ice cream bars, sticks and cones - quick bites delivered fast.",
                "Sticks,Cones,Budget", "Andheri East", "Mumbai", 4.1, 18, 15, 49);
        item(s6, "Choco Bar", "Vanilla ice cream dipped in chocolate", "Stick", 40, true);
        item(s6, "Orange Candy", "Tangy orange ice lolly", "Stick", 25, false);
        item(s6, "Butterscotch Cone", "Butterscotch with crunchy praline bits", "Cone", 60, true);
        item(s6, "Cassata Slice", "Layers of strawberry, pista and vanilla", "Cup", 90, false);
        item(s6, "Vanilla Party Tub", "1 litre classic vanilla", "Tub", 250, false);

        Supplier s7 = supplier("Sundae Street", "Loaded sundaes, waffles and milkshakes. Late-night favourite.",
                "Sundae,Waffles,Shakes", "Anna Nagar", "Chennai", 4.2, 40, 39, 149);
        s7.setOpen(false);
        item(s7, "Banana Split", "Three scoops, banana, cherries and whipped cream", "Sundae", 230, true);
        item(s7, "Waffle Sundae", "Belgian waffle topped with ice cream and syrup", "Sundae", 250, false);
        item(s7, "Oreo Shake Sundae", "Oreo ice cream with crushed cookies", "Sundae", 210, false);

        supplierRepository.save(s1);
        supplierRepository.save(s2);
        supplierRepository.save(s3);
        supplierRepository.save(s4);
        supplierRepository.save(s5);
        supplierRepository.save(s6);
        supplierRepository.save(s7);
        log.info("Seeded {} suppliers", supplierRepository.count());
        attachSampleImages();
    }

    /**
     * Gives suppliers and ice creams without an image the bundled sample photo matching their name
     * (classpath:/static/images/[supplier-]<slug>.jpg, served at /images/**). Admin-set images are never overwritten.
     */
    private void attachSampleImages() {
        int updated = 0;
        for (Supplier s : supplierRepository.findAll()) {
            if (isBlank(s.getImageUrl())) {
                String path = sampleImage("supplier-" + slug(s.getName()));
                if (path != null) {
                    s.setImageUrl(path);
                    updated++;
                }
            }
            for (IceCream i : s.getIceCreams()) {
                if (isBlank(i.getImageUrl())) {
                    String path = sampleImage(slug(i.getName()));
                    if (path != null) {
                        i.setImageUrl(path);
                        updated++;
                    }
                }
            }
        }
        if (updated > 0) log.info("Attached sample images to {} suppliers/ice creams", updated);
    }

    private static String sampleImage(String slug) {
        String file = "images/" + slug + ".jpg";
        return new ClassPathResource("static/" + file).exists() ? "/" + file : null;
    }

    private static String slug(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static Supplier supplier(String name, String description, String tags, String area, String city,
                                     double rating, int deliveryMins, int deliveryFee, int minOrder) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setDescription(description);
        s.setTags(tags);
        s.setAddress(area + ", " + city);
        s.setCity(city);
        s.setRating(rating);
        s.setDeliveryTimeMins(deliveryMins);
        s.setDeliveryFee(BigDecimal.valueOf(deliveryFee));
        s.setMinOrderAmount(BigDecimal.valueOf(minOrder));
        s.setOpen(true);
        return s;
    }

    private static void item(Supplier s, String name, String description, String category, int price, boolean bestseller) {
        IceCream i = new IceCream();
        i.setName(name);
        i.setDescription(description);
        i.setCategory(category);
        i.setPrice(BigDecimal.valueOf(price));
        i.setBestseller(bestseller);
        i.setVeg(true);
        i.setAvailable(true);
        i.setSupplier(s);
        s.getIceCreams().add(i);
    }
}
