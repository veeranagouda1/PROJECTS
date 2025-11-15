package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.model.Trip;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.TripRepository;
import com.travelplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {
    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Trip> getUserTrips(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return tripRepository.findByUserOrderByStartDateDesc(user);
    }

    public Trip createTrip(Trip trip, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        trip.setUser(user);
        trip.setCreatedAt(LocalDateTime.now());
        trip.setUpdatedAt(LocalDateTime.now());
        return tripRepository.save(trip);
    }

    public Trip updateTrip(Long tripId, Trip tripDetails, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        trip.setDestination(tripDetails.getDestination());
        trip.setStartDate(tripDetails.getStartDate());
        trip.setEndDate(tripDetails.getEndDate());
        trip.setDescription(tripDetails.getDescription());
        trip.setBudget(tripDetails.getBudget());
        trip.setNotes(tripDetails.getNotes());
        trip.setUpdatedAt(LocalDateTime.now());

        return tripRepository.save(trip);
    }

    public void deleteTrip(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        tripRepository.delete(trip);
    }
}

