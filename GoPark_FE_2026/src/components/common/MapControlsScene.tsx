"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Component hiển thị scene 3D với MapControls
 * Bao gồm các đối tượng 3D như bãi đỗ xe, đèn giao thông, xe cộ di chuyển tự động
 * Tự động điều chỉnh camera dựa vào route hiện tại (login/register)
 */
export default function MapControlsScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const targetXRef = useRef(250);

  useEffect(() => {
    if (pathname?.includes("/signup") || pathname?.includes("/register")) { // Added /register support
      targetXRef.current = -250;
    } else {
      targetXRef.current = 250;
    }
  }, [pathname]);

  useEffect(() => {
    let camera: any,
      controls: any,
      scene: any,
      renderer: any,
      logoMesh: any,
      group: any,
      cars: { mesh: any, target: {x: number, z: number} | null, speed: number }[] = [],
      parkingLocations: {x: number, z: number}[] = [],
      obstacles: {x: number, z: number, r: number}[] = [],
      floatOffset = 0;

    (async () => {
      const THREE = await import("three");
      // @ts-ignore
      const { FontLoader } = await import("three/addons/loaders/FontLoader.js");
      // @ts-ignore
      const { TextGeometry } = await import("three/addons/geometries/TextGeometry.js");
      // @ts-ignore
      const { MapControls } = await import(
        "three/addons/controls/MapControls.js"
      );

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xcccccc);
      scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setAnimationLoop(animate);

      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      // Shift camera to the right so the center (0,0,0) appears on the left
      camera.position.set(250, 200, 400);

      // MapControls
      controls = new MapControls(camera, renderer.domElement);
      // Look at a point to the right of the origin
      controls.target.set(250, 0, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 100;
      controls.maxDistance = 500;
      controls.maxPolarAngle = Math.PI / 2;

      // WORLD INSTANCED BOXES
      const geometry = new THREE.BoxGeometry();
      geometry.translate(0, 0.5, 0);
      const material = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        flatShading: true,
      });

      const mesh = new THREE.InstancedMesh(geometry, material, 500);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < 500; i++) {
        dummy.position.x = Math.random() * 1600 - 800;
        dummy.position.y = 0;
        dummy.position.z = Math.random() * 1600 - 800;
        dummy.scale.x = 20;
        dummy.scale.y = Math.random() * 80 + 10;
        dummy.scale.z = 20;

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        obstacles.push({x: dummy.position.x, z: dummy.position.z, r: 25});
      }

      scene.add(mesh);

      /**
       * Tạo mesh bãi đỗ xe
       * @param x - Tọa độ x
       * @param z - Tọa độ z
       * @param rotation - Góc xoay
       * @returns Group chứa các object của bãi đỗ xe
       */
      const createParkingLot = (x: number, z: number, rotation: number) => {
        const lotGroup = new THREE.Group();
        lotGroup.position.set(x, 0.5, z);
        lotGroup.rotation.y = rotation;

        // Asphalt Base
        const baseGeo = new THREE.BoxGeometry(120, 1, 80);
        const baseMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        lotGroup.add(base);

        // Parking Lines (White strips)
        const lineGeo = new THREE.BoxGeometry(2, 1.2, 30);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        for(let i = -4; i <= 4; i++) {
            if (i === 0) continue; // Skip center for driving lane
            // Top row
            const line1 = new THREE.Mesh(lineGeo, lineMat);
            line1.position.set(i * 12, 0, -20);
            lotGroup.add(line1);
            
            // Bottom row
            const line2 = new THREE.Mesh(lineGeo, lineMat);
            line2.position.set(i * 12, 0, 20);
            lotGroup.add(line2);
        }

        // Parking Sign "P"
        const poleGeo = new THREE.CylinderGeometry(1, 1, 15);
        const poleMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(-50, 7.5, 35);
        lotGroup.add(pole);

        const signGeo = new THREE.BoxGeometry(8, 8, 1);
        const signMat = new THREE.MeshPhongMaterial({ color: 0x0000ff }); // Blue
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(-50, 15, 35);
        lotGroup.add(sign);
        
        // "P" text representation (White box)
        const pGeo = new THREE.BoxGeometry(4, 5, 1.2);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set(-50, 15, 35);
        lotGroup.add(pMesh);

        return lotGroup;
      };

      /**
       * Tạo đèn giao thông
       * @param x - Tọa độ x
       * @param z - Tọa độ z
       * @returns Group chứa các object đèn giao thông
       */
      const createTrafficLight = (x: number, z: number) => {
        const tlGroup = new THREE.Group();
        tlGroup.position.set(x, 0, z);

        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 20),
            new THREE.MeshPhongMaterial({ color: 0x444444 })
        );
        pole.position.y = 10;
        tlGroup.add(pole);

        // Housing
        const housing = new THREE.Mesh(
            new THREE.BoxGeometry(6, 12, 4),
            new THREE.MeshPhongMaterial({ color: 0x111111 })
        );
        housing.position.y = 18;
        tlGroup.add(housing);

        // Lights
        const lightGeo = new THREE.CylinderGeometry(1.5, 1.5, 1);
        lightGeo.rotateX(Math.PI/2);
        
        const red = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        red.position.set(0, 21, 2);
        tlGroup.add(red);

        const yellow = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        yellow.position.set(0, 18, 2);
        tlGroup.add(yellow);

        const green = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        green.position.set(0, 15, 2);
        tlGroup.add(green);

        return tlGroup;
      };

      /**
       * Tạo biển báo giao thông
       * @param x - Tọa độ x
       * @param z - Tọa độ z
       * @param type - Loại biển báo ('stop' hoặc 'yield')
       * @returns Group chứa các object biển báo
       */
      const createSign = (x: number, z: number, type: 'stop' | 'yield') => {
          const group = new THREE.Group();
          group.position.set(x, 0, z);
          
          const pole = new THREE.Mesh(
              new THREE.CylinderGeometry(0.5, 0.5, 15),
              new THREE.MeshPhongMaterial({ color: 0x888888 })
          );
          pole.position.y = 7.5;
          group.add(pole);

          let signMesh;
          if (type === 'stop') {
              signMesh = new THREE.Mesh(
                  new THREE.CylinderGeometry(4, 4, 0.5, 8), // Octagon-ish
                  new THREE.MeshPhongMaterial({ color: 0xff0000 })
              );
              signMesh.rotation.x = Math.PI/2;
          } else {
              signMesh = new THREE.Mesh(
                  new THREE.CylinderGeometry(4, 0, 0.5, 3), // Triangle
                  new THREE.MeshPhongMaterial({ color: 0xffcc00 })
              );
              signMesh.rotation.x = Math.PI/2;
              signMesh.rotation.z = Math.PI; // Point down
          }
          signMesh.position.y = 15;
          signMesh.position.z = 0.5;
          group.add(signMesh);
          
          return group;
      };

      // Place Parking Lots
      for (let i = 0; i < 30; i++) {
         let x, z;
         do {
           x = Math.random() * 1400 - 700;
           z = Math.random() * 1400 - 700;
         } while (Math.abs(x) < 250 && Math.abs(z) < 250);
         
         scene.add(createParkingLot(x, z, Math.random() * Math.PI));
         parkingLocations.push({x, z});
      }

      // Place Traffic Lights & Signs
      for (let i = 0; i < 80; i++) {
         let x, z;
         do {
           x = Math.random() * 1400 - 700;
           z = Math.random() * 1400 - 700;
         } while (Math.abs(x) < 200 && Math.abs(z) < 200);
         
         if (Math.random() > 0.5) {
            scene.add(createTrafficLight(x, z));
         } else {
            scene.add(createSign(x, z, Math.random() > 0.5 ? 'stop' : 'yield'));
         }
      }
      // -----------------------------------

      // --- Custom Text & Logo ---
      group = new THREE.Group();
      scene.add(group);
      
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font: any) {
        const textGeo = new TextGeometry('GoPark', {
          font: font,
          size: 60, // Reduced size slightly
          depth: 10,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 2,
          bevelSize: 1,
          bevelOffset: 0,
          bevelSegments: 5
        });
        
        textGeo.computeBoundingBox();
        const textWidth = textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x;
        
        // Center the text geometry vertically
        const textCenterY = (textGeo.boundingBox!.max.y + textGeo.boundingBox!.min.y) / 2;
        textGeo.translate(0, -textCenterY, 0);

        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x156289, 
            specular: 0x111111,
            shininess: 200
        });
        const textMesh = new THREE.Mesh(textGeo, textMaterial);
        
        // Center text horizontally
        textMesh.position.set(-textWidth / 2, 0, 0);

        group.add(textMesh);
        
        // Lift the whole group up
        group.position.y = 80;
      });
      // --------------------------

      // LIGHTS
      const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
      dirLight1.position.set(1, 1, 1);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
      dirLight2.position.set(-1, -1, -1);
      scene.add(dirLight2);

      scene.add(new THREE.AmbientLight(0x555555));

      /**
       * Tạo xe hơi
       * @returns Group chứa các object xe hơi
       */
      const createCar = () => {
        const carGroup = new THREE.Group();

        // Car Body
        const bodyGeo = new THREE.BoxGeometry(60, 15, 30);
        const bodyMat = new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 12;
        carGroup.add(body);

        // Car Cabin
        const cabinGeo = new THREE.BoxGeometry(35, 12, 24);
        const cabinMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.x = -6;
        cabin.position.y = 25.5;
        carGroup.add(cabin);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(6, 6, 6, 32);
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        const wheelPositions = [
          { x: -18, z: 15 },
          { x: 18, z: 15 },
          { x: -18, z: -15 },
          { x: 18, z: -15 },
        ];

        wheelPositions.forEach(pos => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(pos.x, 6, pos.z);
          carGroup.add(wheel);
        });

        return carGroup;
      };

      // Create Multiple Cars
      for(let i=0; i<5; i++) {
          const c = createCar();
          // Random start pos
          c.position.set(Math.random() * 1400 - 700, 0, Math.random() * 1400 - 700);
          scene.add(c);
          cars.push({ mesh: c, target: null, speed: 0.2 + Math.random() * 0.3 });
      }
      // ------------------

      /**
       * Xử lý sự kiện resize cửa sổ
       * Cập nhật aspect ratio của camera và kích thước renderer
       */
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);
    })();

    /**
     * Hàm animation loop cho Three.js
     * Cập nhật điều khiển, camera, chuyển động của xe và render scene
     */
    function animate() {
      if (typeof controls?.update === "function") {
        controls.update();
      }

      // Camera Transition Logic
      if (camera && controls) {
        const targetX = targetXRef.current;
        const lerpFactor = 0.02;
        
        // Smoothly move camera and target together
        // We check if we are far from the target to avoid endless micro-updates
        if (Math.abs(controls.target.x - targetX) > 1) {
            const diff = (targetX - controls.target.x) * lerpFactor;
            controls.target.x += diff;
            camera.position.x += diff;
        }
      }
      
      // Animate Logo Rotation
      if (logoMesh) {
        logoMesh.rotation.y += 0.01;
        logoMesh.rotation.x += 0.005;
      }

      // Animate Group Floating
      if (group) {
        floatOffset += 0.02;
        group.position.y = 80 + Math.sin(floatOffset) * 10;
      }

      // Animate Cars
      cars.forEach(carData => {
          const { mesh, speed } = carData;
          
          if (!carData.target) {
              // Pick random parking lot
              if (parkingLocations.length > 0) {
                  const loc = parkingLocations[Math.floor(Math.random() * parkingLocations.length)];
                  carData.target = { x: loc.x, z: loc.z };
              } else {
                  carData.target = { x: 0, z: 0 };
              }
          }

          if (carData.target) {
              const dx = carData.target.x - mesh.position.x;
              const dz = carData.target.z - mesh.position.z;
              const dist = Math.sqrt(dx*dx + dz*dz);

              if (dist < 10) {
                  // Reached target, pick new one
                  carData.target = null;
              } else {
                  // Desired direction
                  let dirX = dx / dist;
                  let dirZ = dz / dist;

                  // Obstacle Avoidance
                  const viewDist = 100;
                  let avoidX = 0;
                  let avoidZ = 0;

                  for (const obs of obstacles) {
                      const ox = obs.x - mesh.position.x;
                      const oz = obs.z - mesh.position.z;
                      const d = Math.sqrt(ox*ox + oz*oz);

                      if (d < viewDist) {
                          // Simple repulsion force
                          const force = (viewDist - d) / viewDist;
                          avoidX -= (ox / d) * force * 2.0; // Stronger avoidance
                          avoidZ -= (oz / d) * force * 2.0;
                      }
                  }

                  // Combine forces
                  dirX += avoidX;
                  dirZ += avoidZ;

                  // Normalize again
                  const finalLen = Math.sqrt(dirX*dirX + dirZ*dirZ);
                  if (finalLen > 0.001) {
                      dirX /= finalLen;
                      dirZ /= finalLen;
                  }

                  // Move
                  mesh.position.x += dirX * speed;
                  mesh.position.z += dirZ * speed;
                  
                  // Rotate to face movement direction
                  mesh.rotation.y = -Math.atan2(dirZ, dirX);
              }
          }
      });

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }

    return () => {
      // Cleanup
      if (renderer) {
        renderer.dispose();
      }
      if (controls) {
        controls.dispose();
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      ></div>
    </>
  );
}
