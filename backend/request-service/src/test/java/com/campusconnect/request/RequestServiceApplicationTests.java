package com.campusconnect.request;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:reqtestdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.data.mongodb.uri=mongodb://localhost:27017/test_dummy",
    "spring.cache.type=none",
    "eureka.client.enabled=false"
})
class RequestServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
