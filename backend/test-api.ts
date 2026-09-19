import { AuthController } from './src/controllers/authController';

const req = {} as any;
const res = {
  status: (code: number) => ({
    json: (data: any) => {
      console.log("Status:", code);
      console.log("Total Users:", data.length);
      console.log("College Students:", data.filter((u: any) => u.section === 'College Student').length);
      console.log("New Users:", data.filter((u: any) => u.section === 'New User').length);
      console.log("Sample College Student:", data.find((u: any) => u.section === 'College Student'));
    }
  })
} as any;

async function test() {
  await AuthController.getAllUsers(req, res);
}

test();
