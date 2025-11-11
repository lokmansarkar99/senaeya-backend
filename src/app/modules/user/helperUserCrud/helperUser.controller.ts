import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { HelperUserService } from "./helperUser.service";
import { JwtPayload } from "jsonwebtoken";
// Get local users
const addRemoveEditHelperUserZodSchema = catchAsync(async (req, res) => {
     const result = await HelperUserService.addRemoveEditHelperUserZodSchema(req.user as JwtPayload, req.body);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Local users retrieved successfully',
          data: result,
     });
});


export const HelperUserController = {
     addRemoveEditHelperUserZodSchema,
};
