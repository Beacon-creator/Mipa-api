import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User, IUserDocument, IAddress } from "./user.model";
import { generateOTP } from "../../utils/otp";


function getUserId(req: Request): string | null {
  return (req as any).userId ?? null; // set by auth.middleware
}


function toUserDTO(user: IUserDocument) {
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    location: user.location,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  };
}


// GET /api/users/me
export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me/profile
// body: { name?, location?, phone?, avatarUrl? }
export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, location, phone, avatarUrl } = req.body as {
      name?: string;
      location?: string;
      phone?: string;
      avatarUrl?: string;
    };

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (phone !== undefined) updates.phone = phone;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me/email
// body: { email }
export async function updateEmailHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Simple direct update; you already have OTP flows in auth module for signup
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { email: email.toLowerCase() },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me/password
// body: { currentPassword, newPassword }
export async function updatePasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both currentPassword and newPassword are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/payment-settings
export async function getPaymentSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("paymentMethods");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ paymentMethods: user.paymentMethods ?? [] });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me/payment-settings
// body: { paymentMethods: IPaymentMethod[] }
export async function updatePaymentSettingsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { paymentMethods } = req.body as { paymentMethods?: unknown };
    if (!Array.isArray(paymentMethods)) {
      return res.status(400).json({ message: "paymentMethods must be an array" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { paymentMethods },
      { new: true, runValidators: true }
    ).select("paymentMethods");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ paymentMethods: user.paymentMethods ?? [] });
  } catch (err) {
    next(err);
  }
}


export async function contactUsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { subject, message } = req.body as { subject?: string; message?: string };

    if (!subject || !message) {
      return res.status(400).json({ message: "subject and message are required" });
    }

    // You can store this in a "SupportTicket" collection later.
    console.log("Contact us:", { userId, subject, message });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}


/**
 * EMAIL CHANGE WITH OTP (no real email, just returns the code)
 */

// POST /api/users/me/email/change/request
// body: { newEmail }
export async function requestEmailChangeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { newEmail } = req.body as { newEmail?: string };
    if (!newEmail) {
      return res.status(400).json({ message: "newEmail is required" });
    }

    const normalized = newEmail.toLowerCase();

    const existing = await User.findOne({ email: normalized, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.emailVerificationCode = code;
    user.emailVerificationCodeExpiresAt = expires;
    await user.save();

    // In production you'd send an email. For now, return the code.
    res.json({
      ok: true,
      verificationCode: code,
      newEmail: normalized,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/me/email/change/confirm
// body: { newEmail, code }
export async function confirmEmailChangeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { newEmail, code } = req.body as { newEmail?: string; code?: string };
    if (!newEmail || !code) {
      return res.status(400).json({ message: "newEmail and code are required" });
    }

    const normalized = newEmail.toLowerCase();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpiresAt) {
      return res.status(400).json({ message: "No verification code on file" });
    }

    const now = new Date();
    if (user.emailVerificationCodeExpiresAt < now) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check again that email isn't used by someone else (safety)
    const existing = await User.findOne({ email: normalized, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    user.email = normalized;
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpiresAt = null;
    await user.save();

    res.json({ user: toUserDTO(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * ADDRESS MANAGEMENT
 */

// GET /api/users/me/addresses
export async function listAddressesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ addresses: user.addresses ?? [] });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/me/addresses
// body: { id?, label?, line1, line2?, city, state?, postalCode?, country?, isDefault? }
// if id present → update that address; else create new
export async function upsertAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      id,
      label,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body as Partial<IAddress> & { id?: string };

    if (!line1 || !city) {
      return res.status(400).json({ message: "line1 and city are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let addressDoc: any;

    if (id) {
      // update existing
      addressDoc = user.addresses?.find((a: any) => a._id?.toString() === id);
      if (!addressDoc) {
        return res.status(404).json({ message: "Address not found" });
      }

      if (label !== undefined) addressDoc.label = label;
      if (line1 !== undefined) addressDoc.line1 = line1;
      if (line2 !== undefined) addressDoc.line2 = line2;
      if (city !== undefined) addressDoc.city = city;
      if (state !== undefined) addressDoc.state = state;
      if (postalCode !== undefined) addressDoc.postalCode = postalCode;
      if (country !== undefined) addressDoc.country = country;
      if (isDefault !== undefined) addressDoc.isDefault = isDefault;
    } else {
      // create new
      addressDoc = {
        label,
        line1,
        line2,
        city,
        state,
        postalCode,
        country,
        isDefault: !!isDefault,
      };
      user.addresses = user.addresses ?? [];
      user.addresses.push(addressDoc as any);
    }

    // Ensure only one default
    if (addressDoc.isDefault) {
      user.addresses!.forEach((a: any) => {
        if (a._id?.toString() !== addressDoc._id?.toString()) {
          a.isDefault = false;
        }
      });
    }

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/me/addresses/:addressId
export async function deleteAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { addressId } = req.params as { addressId: string };

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.addresses?.find((a: any) => a._id?.toString() === addressId);
    if (!addr) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove the address from the array instead of calling deleteOne on the interface
    user.addresses = user.addresses?.filter((a: any) => a._id?.toString() !== addressId) ?? [];

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/me/addresses/:addressId/default
export async function setDefaultAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { addressId } = req.params as { addressId: string };

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.addresses?.find((a: any) => a._id?.toString() === addressId);
    if (!addr) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses!.forEach((a: any) => {
      a.isDefault = a._id?.toString() === addressId;
    });

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}