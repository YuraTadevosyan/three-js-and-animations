import { damp, m4LookAt, m4Multiply, m4Perspective, mat4, type Mat4, type Vec3 } from './math';

/**
 * A fixed observer.
 *
 * The camera never travels between scales. Each stage instead scales and
 * translates its own content past the lens, which is what makes the crossfades
 * between scales stable: there is no camera interpolation to go wrong when two
 * stages are on screen at once, and float precision stays sane whether we are
 * looking at a millimetre of tissue or an ångström of hydrogen bond.
 */
export class Camera {
  readonly position: Vec3 = [0, 0, 6];
  readonly target: Vec3 = [0, 0, 0];
  readonly up: Vec3 = [0, 1, 0];

  fov = (46 * Math.PI) / 180;
  near = 0.05;
  far = 260;

  readonly view: Mat4 = mat4();
  readonly projection: Mat4 = mat4();
  readonly viewProjection: Mat4 = mat4();

  /** Smoothed pointer parallax, in radians of orbit. */
  private parallaxX = 0;
  private parallaxY = 0;

  update(aspect: number, pointerX: number, pointerY: number, time: number, dt: number): void {
    // Ease toward the pointer so a fast mouse flick doesn't snap the view.
    this.parallaxX = damp(this.parallaxX, pointerX * 0.16, 3.5, dt);
    this.parallaxY = damp(this.parallaxY, pointerY * 0.1, 3.5, dt);

    // A slow figure-eight drift keeps the frame alive while the user is idle.
    const driftX = Math.sin(time * 0.11) * 0.022;
    const driftY = Math.sin(time * 0.083) * 0.017;

    const yaw = this.parallaxX + driftX;
    const pitch = this.parallaxY + driftY;
    const radius = 6;

    this.position[0] = Math.sin(yaw) * Math.cos(pitch) * radius;
    this.position[1] = Math.sin(pitch) * radius;
    this.position[2] = Math.cos(yaw) * Math.cos(pitch) * radius;

    m4Perspective(this.projection, this.fov, aspect, this.near, this.far);
    m4LookAt(this.view, this.position, this.target, this.up);
    m4Multiply(this.viewProjection, this.projection, this.view);
  }
}
