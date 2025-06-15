import { Router } from "express";
import { Recruiter } from "../models/recruiter.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

// Get all recruiters
router.get("/", async (req, res) => {
    try {
        const recruiters = await Recruiter.find()
            .select("-password")
            .select("companyname email profile role");

        return res.status(200).json(
            new ApiResponse(200, recruiters, "Recruiters fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching recruiters");
    }
});

// Get recruiter profile by ID
router.get("/profile/:id", async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.params.id)
            .select("-password")
            .populate("profile");

        if (!recruiter) {
            return res.status(404).json(
                new ApiResponse(404, null, "Recruiter not found")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, recruiter, "Recruiter profile fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching recruiter profile");
    }
});

export default router; 