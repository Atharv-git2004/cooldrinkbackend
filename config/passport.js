import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true, // Render-ൽ ഹോസ്റ്റ് ചെയ്യുമ്പോൾ നിർബന്ധമായും വേണ്ടത്
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ഇമെയിൽ വെച്ച് യൂസർ ഉണ്ടോ എന്ന് നോക്കുന്നു
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // യൂസർ ഉണ്ട്, പക്ഷെ googleId ഇല്ലെങ്കിൽ അത് അപ്ഡേറ്റ് ചെയ്യുന്നു
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          // പുതിയ യൂസറെ ക്രിയേറ്റ് ചെയ്യുന്നു
          const newUser = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            role: "user",
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// Session-ലേക്ക് യൂസറെ സേവ് ചെയ്യാൻ
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Session-ൽ നിന്ന് യൂസറെ എടുക്കാൻ
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
