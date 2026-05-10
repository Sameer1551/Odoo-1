import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const DB_PATH = path.join(process.cwd(), 'data', 'users.json')

async function getUsers() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `pbkdf2:${salt}:${hash}`
}

function verifyPassword(password: string, storedPassword: string) {
  if (!storedPassword.startsWith('pbkdf2:')) {
    return password === storedPassword
  }

  const [, salt, hash] = storedPassword.split(':')
  if (!salt || !hash) return false

  const candidate = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')
  const stored = Buffer.from(hash, 'hex')
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate)
}

export async function POST(req: Request) {
  try {
    const { action, email, password, mobile } = await req.json()
    const users = await getUsers()

    if (action === 'signup') {
      if (users.find((u: any) => u.email === email)) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }
      users.push({ email, password: hashPassword(password), mobile })
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
      await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2))
      return NextResponse.json({ success: true })
    }

    if (action === 'login') {
      const user = users.find((u: any) => u.email === email && verifyPassword(password, u.password))
      if (user) {
        if (!user.password.startsWith('pbkdf2:')) {
          user.password = hashPassword(password)
          await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2))
        }
        return NextResponse.json({ success: true, user: { email: user.email, mobile: user.mobile } })
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
