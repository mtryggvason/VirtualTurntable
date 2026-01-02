import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { getUserSongs } from "../../utils/firestore";
import styles from "../../styles/UserPage.module.css";

function UserPage() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: songs = [],
    error,
    isLoading,
  } = useSWR(user ? "userSongs/" + user.uid : null, () =>
    getUserSongs(user.uid)
  );

  console.log(isLoading);

  if (error) {
    return (
      <div className="app">
        <div className={styles.container}>
          <div className={styles.error}>
            Error loading songs: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className={styles.userDetails}>
              <h1>{user?.displayName || user?.email}</h1>
              <p>{songs.length} songs uploaded</p>
            </div>
          </div>

          <Link href="/user/upload">
            <button className={styles.uploadBtn}>Upload New Song</button>
          </Link>
        </div>

        <div className={styles.content}>
          <h2>My Songs</h2>

          {isLoading ? (
            <div className={styles.loading}>Loading your songs...</div>
          ) : songs.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🎵</div>
              <h3>No songs uploaded yet</h3>
              <p>Upload your first song to get started!</p>
              <Link href="/user/upload">
                <button className={styles.uploadBtn}>
                  Upload Your First Song
                </button>
              </Link>
            </div>
          ) : (
            <div className={styles.songsGrid}>
              {songs.map((song) => (
                <div key={song.id} className={styles.songCard}>
                  <div className={styles.songArtwork}>
                    {song.artworkUrl ? (
                      <img src={song.artworkUrl} alt={`${song.name} artwork`} />
                    ) : (
                      <div className={styles.defaultArtwork}></div>
                    )}
                  </div>
                  <div className={styles.songInfo}>
                    <h3>{song.name}</h3>
                    <p>{song.artist}</p>
                    <div className={styles.songMeta}>
                      <span>
                        Uploaded{" "}
                        {song.uploadedAt
                          ? new Date(
                              song.uploadedAt.toDate()
                            ).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.songActions}>
                    <button
                      className={styles.playBtn}
                      onClick={() => {
                        router.push(`/play/${song.id}`);
                      }}
                    >
                      Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserPageProtected() {
  return (
    <ProtectedRoute>
      <UserPage />
    </ProtectedRoute>
  );
}
