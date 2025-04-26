import HomeIcon from '@mui/icons-material/Home'
import ExploreIcon from '@mui/icons-material/Explore'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MessageIcon from '@mui/icons-material/Message'
import GroupIcon from '@mui/icons-material/Group'
import SchoolIcon from '@mui/icons-material/School'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'

export const navigationMenu = [
    {
        title: "Home",
        icon: <HomeIcon />,
        path: "/"
    },
    {
        title: "Notifications",
        icon: <NotificationsIcon />,
        path: "/notifications"
    },
    {
        title: "Communities",
        icon: <GroupIcon />,
        path: "/communities"
    },
    {
        title: "Skill Sharing",
        icon: <SchoolIcon />,
        path: "/skill-sharing"
    },
    {
        title: "Learning Journey",
        icon: <AutoStoriesIcon />,
        path: "/learning-journey"
    },
    {
        title: "Profile",
        icon: <AccountCircleIcon />,
        path: "/profile/:id"
    }
] 