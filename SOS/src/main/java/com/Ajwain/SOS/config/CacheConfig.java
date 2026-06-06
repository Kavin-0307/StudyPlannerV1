package com.Ajwain.SOS.config;

import java.time.Duration;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
@Configuration
public class CacheConfig {

    // 1. Move the serializer creation out so both beans can safely consume it
    private RedisCacheConfiguration createBaseCacheConfig(GenericJackson2JsonRedisSerializer serializer) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(60))
                .disableCachingNullValues()
                .serializeValuesWith(SerializationPair.fromSerializer(serializer));
    }
    @Bean
    public GenericJackson2JsonRedisSerializer redisSerializer() {

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }

    @Bean
    public RedisCacheConfiguration cacheConfiguration(
            GenericJackson2JsonRedisSerializer serializer
    ) {
        return createBaseCacheConfig(serializer);
    }
    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(
            GenericJackson2JsonRedisSerializer serializer
    ) {

        RedisCacheConfiguration baseConfig =
                createBaseCacheConfig(serializer);

        return (builder) -> builder.withCacheConfiguration("subjects",baseConfig.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("deadlines",baseConfig.entryTtl(Duration.ofMinutes(20)))
                .withCacheConfiguration("studyplan",baseConfig.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("dashboard",baseConfig.entryTtl(Duration.ofMinutes(5))
                );
    }
}