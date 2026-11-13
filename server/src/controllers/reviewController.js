import { reviewService } from "../services/reviewService.js";

export const reviewController = {
  async createRequest(req, res) {
    return res.status(201).json({ request: await reviewService.createRequest(req.user.id, req.body) });
  },
  async listRequests(req, res) {
    return res.json(await reviewService.listRequests(req.user, req.auth.role, req.query));
  },
  async cancel(req, res) {
    return res.json({ request: await reviewService.cancelRequest(req.user.id, req.params.id) });
  },
  async accept(req, res) {
    return res.json({ request: await reviewService.respond(req.studentProfile.id, req.user.id, req.params.id, "accept") });
  },
  async reject(req, res) {
    return res.json({ request: await reviewService.respond(req.studentProfile.id, req.user.id, req.params.id, "reject") });
  },
  async start(req, res) {
    return res.json({ request: await reviewService.startReview(req.studentProfile.id, req.user.id, req.params.id) });
  },
  async submit(req, res) {
    return res.json({ review: await reviewService.submit(req.studentProfile.id, req.user.id, req.params.id, req.body) });
  },
  async get(req, res) {
    return res.json({ review: await reviewService.getReview(req.user.id, req.auth.role, req.params.id) });
  },
  async rate(req, res) {
    return res.status(201).json({ rating: await reviewService.rate(req.user.id, req.params.id, req.body) });
  },
};
