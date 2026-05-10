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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  
  const users = await getUsers()
  const user = users.find((u: any) => u.email === email)
  
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  
  // Don't send password back
  const { password, ...safeUser } = user
  return NextResponse.json(safeUser)
}

export async function PUT(req: Request) {
  try {
    const { currentEmail, email, mobile, password } = await req.json()
    const users = await getUsers()
    
    const index = users.findIndex((u: any) => u.email === currentEmail)
    if (index === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
    // Check if new email already exists (if email is being changed)
    if (email !== currentEmail && users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'New email already in use' }, { status: 400 })
    }
    
    users[index] = { 
      ...users[index], 
      email: email || users[index].email, 
      mobile: mobile || users[index].mobile,
      password: password ? hashPassword(password) : users[index].password 
    }
    
    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2))
    return NextResponse.json({ success: true, user: { email: users[index].email, mobile: users[index].mobile } })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
