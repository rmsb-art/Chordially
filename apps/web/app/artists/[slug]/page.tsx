// CHORD-121: Public artist profile page on web
// CHORD-124: Follow-intent capture placeholder
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "../../../components/layout/shell";
import { Card } from "../../../components/ui/card";
import { listDiscoverySessions } from "../../../lib/discovery";
import { getArtistBySlug } from "../../../lib/artist";
import { getArtistMedia } from "../../../lib/artist-media";
import { recordFollowIntent } from "./actions";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = getArtistBySlug(params.slug);
  if (!artist) return { title: "Artist not found" };
  return {
    title: `${artist.stageName} – Chordially`,
    description: artist.bio || `${artist.stageName} on Chordially`,
    openGraph: {
      title: artist.stageName,
      description: artist.bio || `${artist.stageName} on Chordially`,
      type: "profile"
    }
  };
}

export default function ArtistPublicProfilePage({ params }: Props) {
  const artist = getArtistBySlug(params.slug);

  // Fall back to discovery sessions for artists not in the cookie store
  const sessions = listDiscoverySessions({ status: "live", limit: 100 }).items
    .concat(listDiscoverySessions({ status: "upcoming", limit: 100 }).items)
    .filter((item) => item.slug === params.slug);

  if (!artist && sessions.length === 0) {
    notFound();
  }

  const stageName = artist?.stageName ?? sessions[0]?.artistName ?? params.slug;
  const city = artist?.city ?? sessions[0]?.city ?? "";
  const bio = artist?.bio ?? "";
  const genres = artist
    ? artist.genres.split(",").map((g) => g.trim()).filter(Boolean)
    : sessions[0]?.genres ?? [];
  const media = artist ? getArtistMedia() : { avatarUrl: "", bannerUrl: "", gallery: [] };
  const liveSession = sessions.find((s) => s.isLive);

  return (
    <Shell title={stageName} subtitle={city}>
      {/* Banner */}
      {media.bannerUrl && (
        <img
          src={media.bannerUrl}
          alt={`${stageName} banner`}
          style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: "1.5rem" }}
        />
      )}

      {/* Identity */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
        {media.avatarUrl ? (
          <img
            src={media.avatarUrl}
            alt={`${stageName} avatar`}
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{ width: 80, height: 80, borderRadius: "50%", background: "#2d2d3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}
          >
            🎵
          </div>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{stageName}</h1>
          {city && <p className="muted" style={{ margin: 0 }}>{city}</p>}
          {liveSession && (
            <span className="chip" style={{ background: "#16a34a", color: "#fff" }}>🔴 Live now</span>
          )}
        </div>
      </div>

      {/* Genres */}
      {genres.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          {genres.map((g) => (
            <span className="chip" key={g}>{g}</span>
          ))}
        </div>
      )}

      {/* Bio */}
      {bio && (
        <Card title="About">
          <p>{bio}</p>
        </Card>
      )}

      {/* Live / upcoming sessions */}
      {sessions.length > 0 && (
        <Card title={liveSession ? "Live now" : "Upcoming"}>
          {sessions.map((s) => (
            <div key={s.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{s.title}</strong>
              <span className="muted" style={{ marginLeft: "0.5rem" }}>
                {new Date(s.startsAt).toLocaleString()}
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* CHORD-124: Follow-intent capture */}
      <Card title="Stay in the loop">
        <p className="muted">
          Full follow notifications are coming soon. Tap below to register your interest.
        </p>
        <form action={recordFollowIntent}>
          <input type="hidden" name="artistSlug" value={params.slug} />
          <button className="button" type="submit">
            Notify me when {stageName} goes live
          </button>
        </form>
      </Card>
    </Shell>
  );
}
