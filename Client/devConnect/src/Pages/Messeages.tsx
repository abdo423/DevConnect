import {Input} from "@/components/ui/input";
import {Paperclip, Search, Send, Smile, MoreVertical, Phone, Video} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {useSelector, useDispatch} from "react-redux";
import {AppDispatch, RootState} from "@/app/store";
import {createMessage, getMessagesBetweenUsers} from "@/features/Message/messageSlice.ts";
import {useNavigate} from "react-router-dom";
import {fetchFollowings, fetchUnfollowedMessageSenders} from "@/features/Following/followingSlice.ts";
import {formatDistanceToNow} from "date-fns";
import NavBar from "@/components/Navbar";

const MessagePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const {messages} = useSelector((state: RootState) => state.message);
    const {user, isLoggedIn} = useSelector((state: RootState) => state.auth);
    const {following, unfollowedMessageSenders} = useSelector((state: RootState) => state.following);
    const userId = useMemo(() => user?._id, [user?._id]);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            dispatch(fetchFollowings(userId));
            dispatch(fetchUnfollowedMessageSenders());
        }
    }, [dispatch, userId]);

    // Filter functions for search
    const filteredFollowing = useMemo(() => {
        if (!searchQuery.trim()) return following || [];

        return (following || []).filter((person: any) =>
            person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [following, searchQuery]);

    const filteredUnfollowedSenders = useMemo(() => {
        if (!searchQuery.trim()) return unfollowedMessageSenders || [];

        return (unfollowedMessageSenders || []).filter((person: any) =>
            person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [unfollowedMessageSenders, searchQuery]);

    // Check if there are any search results
    const hasSearchResults = filteredFollowing.length > 0 || filteredUnfollowedSenders.length > 0;
    const isSearching = searchQuery.trim().length > 0;



    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedUser) return;

        try {
            // Dispatch the createMessage action
            await dispatch(createMessage({
                receiverId: selectedUser._id,
                content: newMessage,
            })).unwrap();

            // Clear the input immediately
            setNewMessage("");

            // Refresh messages to get the latest conversation
            if (selectedUser._id) {
                dispatch(getMessagesBetweenUsers(selectedUser._id));
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            // You might want to show an error message to the user here
        }
    };

    const handleSelectUser = (person: any) => {
        dispatch(getMessagesBetweenUsers(person._id));
        setSelectedUser(person);
        // Clear the input when switching conversations
        setNewMessage("");
    };

    const profileNavigate = (id: string) => {
        if (!isLoggedIn) return navigate("/login");
        navigate(`/profile/${id}`);
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <>
            <NavBar/>
            <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                {/* Sidebar */}
                <div
                    className="hidden md:flex w-80 flex-shrink-0 border-r border-slate-200/70 bg-white/60 backdrop-blur-sm flex-col h-screen shadow-lg">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Messages
                            </h1>
                            {isSearching && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="text-xs text-slate-500 hover:text-slate-700"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="relative group">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 group-hover:text-blue-500 transition-colors duration-200"/>
                            <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-200"
                            />
                        </div>
                        {isSearching && (
                            <p className="text-xs text-slate-500 mt-2">
                                {hasSearchResults
                                    ? `Found ${filteredFollowing.length + filteredUnfollowedSenders.length} result(s)`
                                    : "No users found"
                                }
                            </p>
                        )}
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Show search results when searching */}
                        {isSearching ? (
                            <div className="p-4">
                                {!hasSearchResults ? (
                                    <div className="text-center py-8">
                                        <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                        <h3 className="text-sm font-medium text-slate-600 mb-1">No users found</h3>
                                        <p className="text-xs text-slate-500">Try searching with a different term</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search Results - Following */}
                                        {filteredFollowing.length > 0 && (
                                            <div className="mb-6">
                                                <h2 className="text-sm font-semibold mb-3 text-slate-700 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                    Following ({filteredFollowing.length})
                                                </h2>
                                                <div className="space-y-2">
                                                    {filteredFollowing.map((person: any) => (
                                                        <div
                                                            key={person._id}
                                                            onClick={() => handleSelectUser(person)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group border transition-all duration-200 ${
                                                                selectedUser?._id === person._id
                                                                    ? 'bg-blue-50 border-blue-200'
                                                                    : 'border-transparent hover:border-blue-100'
                                                            }`}
                                                        >
                                                            <div className="relative">
                                                                <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                                                    <AvatarImage
                                                                        src={person.avatar || "/placeholder.svg"}
                                                                        alt="profile"
                                                                    />
                                                                    <AvatarFallback
                                                                        className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                                                        {person.username?.charAt(0) || "U"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div
                                                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                                                                        {person.username || "Unknown User"}
                                                                    </h3>
                                                                    <p className="text-xs text-slate-500">
                                                                        2h ago
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm text-slate-600 truncate">
                                                                    Perfect! I'll send you the agenda...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Search Results - Others */}
                                        {filteredUnfollowedSenders.length > 0 && (
                                            <div>
                                                <h2 className="text-sm font-semibold mb-3 text-slate-700 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                                    Others ({filteredUnfollowedSenders.length})
                                                </h2>
                                                <div className="space-y-2">
                                                    {filteredUnfollowedSenders.map((person: any) => (
                                                        <div
                                                            key={person._id}
                                                            onClick={() => handleSelectUser(person)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group border transition-all duration-200 ${
                                                                selectedUser?._id === person._id
                                                                    ? 'bg-blue-50 border-blue-200'
                                                                    : 'border-transparent hover:border-blue-100'
                                                            }`}
                                                        >
                                                            <div className="relative">
                                                                <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                                                    <AvatarImage
                                                                        src={person.avatar || "/placeholder.svg"}
                                                                        alt="profile"
                                                                    />
                                                                    <AvatarFallback
                                                                        className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                                                        {person.username?.charAt(0) || "U"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div
                                                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                                                                        {person.username || "Unknown User"}
                                                                    </h3>
                                                                    <p className="text-xs text-slate-500">
                                                                        2h ago
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm text-slate-600 truncate">
                                                                    Perfect! I'll send you the agenda...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Show normal lists when not searching */
                            <>
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Followed people</h2>
                                    <div className="space-y-2">
                                        {following?.map((person: any) => (
                                            <div
                                                key={person._id}
                                                onClick={() => handleSelectUser(person)}
                                                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group border transition-all duration-200 ${
                                                    selectedUser?._id === person._id
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'border-transparent hover:border-blue-100'
                                                }`}
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                                        <AvatarImage
                                                            src={person.avatar || "/placeholder.svg"}
                                                            alt="profile"
                                                        />
                                                        <AvatarFallback
                                                            className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                                            {person.username?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div
                                                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                                                            {person.username || "Unknown User"}
                                                        </h3>
                                                        <p className="text-xs text-slate-500">
                                                            2h ago
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-slate-600 truncate">
                                                        Perfect! I'll send you the agenda...
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Others</h2>
                                    <div className="space-y-2">
                                        {unfollowedMessageSenders?.map((person: any) => (
                                            <div
                                                key={person._id}
                                                onClick={() => handleSelectUser(person)}
                                                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group border transition-all duration-200 ${
                                                    selectedUser?._id === person._id
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'border-transparent hover:border-blue-100'
                                                }`}
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                                        <AvatarImage
                                                            src={person.avatar || "/placeholder.svg"}
                                                            alt="profile"
                                                        />
                                                        <AvatarFallback
                                                            className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                                            {person.username?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div
                                                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                                                            {person.username || "Unknown User"}
                                                        </h3>
                                                        <p className="text-xs text-slate-500">
                                                            2h ago
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-slate-600 truncate">
                                                        Perfect! I'll send you the agenda...
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center justify-between">
                            {selectedUser ? (
                                <div className="flex items-center gap-3 cursor-pointer"
                                     onClick={() => profileNavigate(selectedUser._id)}>
                                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                                        <AvatarImage src={selectedUser.avatar || "/placeholder.svg"}/>
                                        <AvatarFallback
                                            className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                            {selectedUser.username?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {selectedUser.username || "Unknown User"}
                                        </h3>
                                        <p className="text-sm text-green-500 font-medium">Online</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                                        <AvatarFallback
                                            className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                            ?
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Select a conversation</h3>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-200"
                                >
                                    <Phone className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-200"
                                >
                                    <Video className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-200"
                                >
                                    <MoreVertical className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50/30 to-blue-50/20">
                        {selectedUser ? (
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {messages.map((message) => (
                                    <div
                                        key={message._id}
                                        className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"} group`}
                                    >
                                        <div onClick={() => profileNavigate(message.senderId)}
                                             className={`flex items-end gap-2 max-w-[75%] cursor-pointer ${message.senderId === userId ? "flex-row-reverse" : "flex-row"}`}
                                        >
                                            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                                                <AvatarImage
                                                    src={
                                                        message.senderId === userId
                                                            ? user?.avatar || "/placeholder.svg"
                                                            : selectedUser?.avatar || "/placeholder.svg"
                                                    }
                                                />
                                                <AvatarFallback
                                                    className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                                                    {message.senderId === userId
                                                        ? user?.username?.charAt(0) || "U"
                                                        : selectedUser?.username?.charAt(0) || "U"
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={`rounded-2xl px-4 py-3 shadow-sm transform transition-all duration-200 hover:scale-[1.02] ${
                                                    message.senderId === userId
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200/50"
                                                        : "bg-white border border-slate-200/70 text-slate-800 shadow-slate-200/50"
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed">{message.text}</p>
                                                <p className={`text-xs mt-2 ${
                                                    message.senderId === userId ? "text-blue-100" : "text-slate-500"
                                                }`}>
                                                    {formatDistanceToNow(new Date(message.createdAt), {addSuffix: true})}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center text-slate-500">
                                    <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                                    <p>Choose a conversation from the sidebar to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-slate-200/70 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 flex-shrink-0 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-200"
                            >
                                <Paperclip className="h-4 w-4"/>
                            </Button>
                            {following?.some((person) => person._id === selectedUser?._id) ? (
                                <>
                                    <div className="flex-1 relative">
                                        <Input
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e as any);
                                                }
                                            }}
                                            disabled={!selectedUser}
                                            className="pr-12 h-11 text-sm border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-full bg-slate-50/50 hover:bg-slate-50 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={!selectedUser}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-200 disabled:opacity-50"
                                        >
                                            <Smile className="h-4 w-4"/>
                                        </Button>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200/50 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        disabled={!newMessage.trim() || !selectedUser}
                                    >
                                        <Send className="h-4 w-4"/>
                                    </Button>
                                </>
                            ) : (
                                <div className="text-sm text-slate-500 italic px-4 py-2">
                                    You must follow this user to send them a message.
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessagePage;